angular.module('orderCloud')
    .controller('UserGroupProductAssignmentCtrl', UserGroupProductAssignmentController)
;

function UserGroupProductAssignmentController($q, $exceptionHandler, $state, toastr, OrderCloudSDK, ocParameters, ocCatalog, $stateParams, Parameters, Category, UserGroup, CurrentAssignments, ProductList ){
    var vm = this;
    // vm.list = ProductList;
    vm.list = ProductList;
    vm.selectedCategory = Category;
    vm.catalogID = Parameters.catalogid;
    vm.userGroup = UserGroup;

    
    vm.parameters = Parameters;
    //Sort by is a filter on mobile devices
    vm.sortSelection = Parameters.sortBy ? (Parameters.sortBy.indexOf('!') == 0 ? Parameters.sortBy.split('!')[1] : Parameters.sortBy) : null;
    //Check if search was used
    vm.searchResults = Parameters.search && Parameters.search.length > 0;

    vm.filter = function(resetPage) {
        $state.go('productAssignment', ocParameters.Create(vm.parameters, resetPage));
    };

    vm.search = function() {
        vm.filter(true);
    };

    vm.clearSearch = function() {
        vm.parameters.search = null;
        vm.filter(true);
    };

    vm.updateSort = function(value) {
        value ? angular.noop() : value = vm.sortSelection;
        switch(vm.parameters.sortBy) {
            case value:
                vm.parameters.sortBy = '!' + value;
                break;
            case '!' + value:
                vm.parameters.sortBy = null;
                break;
            default:
                vm.parameters.sortBy = value;
        }
        vm.filter(false);
    };

    vm.pageChanged = function() {
        $state.go('.', {page:vm.list.Meta.Page});
    };

    vm.loadMore = function() {
        var parameters = angular.extend(Parameters, {page:vm.list.Meta.Page + 1});
        return OrderCloudSDK.Products.List(parameters)
            .then(function(data) {
                var mappedData = ocCatalog.Products.MapAssignments(CurrentAssignments, data);
                vm.list.Items = vm.list.Items.concat(mappedData.Items);
                vm.list.Meta = mappedData.Meta;

                selectedCheck();
            });
    };

    function selectedCheck() {
        vm.allItemsSelected = (_.filter(vm.list.Items, {Assigned:true}).length == vm.list.Items.length);
    }

    function changedCheck() {
         vm.changedAssignments = ocCatalog.Products.CompareAssignments(CurrentAssignments, vm.list, $stateParams.categoryid);
    }

    selectedCheck();

    vm.selectAllItems = function() {
        vm.allItemsSelected = !vm.allItemsSelected;
        _.map(vm.list.Items, function(i) { i.Assigned = vm.allItemsSelected; });

        changedCheck();
    };

    vm.selectItem = function(scope) {
        if (!scope.product.Assigned) vm.allItemsSelected = false;
        vm.selectedCount = _.filter(vm.list.Items, {Assigned:true}).length;

        changedCheck();
    };

    vm.resetAssignments = function() {
        vm.list = ocCatalog.Products.MapAssignments(CurrentAssignments, vm.list);
        vm.changedAssignments = [];

        selectedCheck();
    };

    vm.addProduct = function(){
        $state.go('productAssignmentUpdate', ocParameters.Create(vm.parameters, true));
    };

    vm.removeAssignment = function(scope){

        vm.changedAssignments = [{'old': scope.product}]
       vm.updateAssignments(true)

    }

    vm.updateAssignments = function(reload) {
        var setPSQueue=[];
        // go through all the new assignments. add userGroupID
       vm.changedAssignments =  _.map(vm.changedAssignments,(assignment)=>{
           if( assignment.new){
                assignment.new.UserGroupID = vm.userGroup.ID;
           }else{
               assignment.old.UserGroupID = vm.userGroup.ID;
           }
            return assignment;
        });
        //grab price list price schedules for those products
        _.each( vm.changedAssignments, (assignment) => {
            if(assignment.new){
                setPSQueue.push(setPriceSchedule(assignment));
            }
        })
       
 
        //update assignment
       return vm.searchLoading = $q.all(setPSQueue)
            .then(()=>{
                return  ocCatalog.Products.UpdateAssignments(CurrentAssignments, vm.changedAssignments, $stateParams.catalogid, $stateParams.buyerid, vm.userGroup.ID )
                    .then(function(data) {
                        angular.forEach(data.Errors, function(ex) {
                            $exceptionHandler(ex);
                        });
                        CurrentAssignments = data.UpdatedAssignments;
                        changedCheck();
                        selectedCheck();
                        if(reload){
                            $state.reload();
                        }
                    })
          
        })
        .catch((err)=>toastr.error(err));

        function setPriceSchedule(assignment){
            return OrderCloudSDK.PriceSchedules.List({search: assignment.new.ProductID})
                .then((priceScheduleList)=>{
                    //determine if asset group is US/Canada pricing
                    if(vm.userGroup.xp && vm.userGroup.xp.Region){
                    let matchingPS = _.filter( priceScheduleList.Items, (ps)=>{
                            return _.some([ps.xp],{Currency: vm.userGroup.xp.Region });
                        });
                        if(matchingPS.length > 0){
                            matchingPS = matchingPS[0];
                            assignment.new.PriceScheduleID = matchingPS.ID;
                            assignment.new.BuyerID = $stateParams.buyerid;
                            return $q.when();
                        }else if(priceScheduleList.Items.length > 0){
                            //need to crate a price schedule
                            let newPS = angular.copy(priceScheduleList.Items[0]);
                                newPS.xp.Currency = vm.userGroup.xp.Region;
                                newPS.ID = newPS.ID.replace(/-.*/,'') + '-' + vm.userGroup.xp.Region;
                                newPS.Name = newPS.ID;
                                return OrderCloudSDK.PriceSchedules.Create(newPS).then( createdPS =>{
                                    assignment.new.PriceScheduleID = createdPS.ID;
                                    assignment.new.BuyerID = $stateParams.buyerid;
                                    return $q.when();
                              });  
                        }else{
                           return $q.reject(`${assignment.new.ProductID} needs a price schedule assigned to it`);
                        } 

                    }else{
                        return $q.reject( `Error, No region assigned to user group`);
                    }
            })
        }
         
    };


}