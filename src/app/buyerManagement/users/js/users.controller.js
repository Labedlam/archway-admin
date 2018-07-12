angular.module('orderCloud')
    .controller('UsersCtrl', UsersController)
;

function UsersController($state, $stateParams, toastr, ppgbuyerurl, OrderCloudSDK, ocUsers, ocParameters, UserList, Parameters, CurrentUser, impersonationClientId) {
    var vm = this;
    vm.list = UserList;
    vm.parameters = Parameters;
    vm.sortSelection = Parameters.sortBy ? (Parameters.sortBy.indexOf('!') == 0 ? Parameters.sortBy.split('!')[1] : Parameters.sortBy) : null;
    vm.currentUser = CurrentUser;

    //Check if search was used
    vm.searchResults = Parameters.search && Parameters.search.length > 0;

    //Reload the state with new parameters
    vm.filter = function(resetPage) {
        $state.go('.', ocParameters.Create(vm.parameters, resetPage));
    };

    //Reload the state with new search parameter & reset the page
    vm.search = function() {
        vm.filter(true);
    };

    //Clear the search parameter, reload the state & reset the page
    vm.clearSearch = function() {
        vm.parameters.search = null;
        vm.filter(true);
    };

    //Conditionally set, reverse, remove the sortBy parameter & reload the state
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

    //Reload the state with the incremented page parameter
    vm.pageChanged = function() {
        $state.go('.', {page:vm.list.Meta.Page});
    };

    //Load the next page of results with all of the same parameters
    vm.loadMore = function() {
        var parameters = angular.extend(Parameters, {page:vm.list.Meta.Page + 1});
        return OrderCloudSDK.Users.List($stateParams.buyerid, Parameters)
            .then(function(data) {
                vm.list.Items = vm.list.Items.concat(data.Items);
                vm.list.Meta = data.Meta;
            });
    };

    vm.editUser = function(scope) {
        ocUsers.Edit(scope.user, $stateParams.buyerid)
            .then(function(updatedUser) {
                vm.list.Items[scope.$index] = updatedUser;
                toastr.success(updatedUser.Username + ' was updated.');
            });
    };

    vm.createUser = function() {
        ocUsers.Create($stateParams.buyerid)
            .then(function(newUser) {
                vm.list.Items.push(newUser);
                vm.list.Meta.TotalCount++;
                vm.list.Meta.ItemRange[1]++;
                toastr.success(newUser.Username + ' was created.');
            });
    };

    vm.deleteUser = function(scope) {
        ocUsers.Delete(scope.user, $stateParams.buyerid)
            .then(function() {
                toastr.success(scope.user.Username + ' was deleted.');
                vm.list.Items.splice(scope.$index, 1);
                vm.list.Meta.TotalCount--;
                vm.list.Meta.ItemRange[1]--;
            });
    };

    vm.impersonateUser = function(scope) {
        return getImpersonation(scope.user)
            .then((impersonation)=>{
                return OrderCloudSDK.Users.GetAccessToken($stateParams.buyerid, scope.user.ID, impersonation)
                .then(function(data) {
                    let user = {
                        ID: vm.currentUser.ID,
                        Name: vm.currentUser.FirstName + '' + vm.currentUser.LastName
                    };
                    let userData = Object.keys(user).map((key) => {
                        return encodeURIComponent(key) + '=' + encodeURIComponent(user[key]);
                    });
                    if (userData) {
                        userData.join('&');
                        let buyerAppUrl = `${ppgbuyerurl}/punchout?token=${data.access_token}user=${userData}`;
                        window.open(buyerAppUrl, '_blank');
                    }
                });
            } );
       
    };

    // this is to ensure that the admin-limited user does not get more roles than they need
    function getImpersonation(userBeingImpersonated){
        return OrderCloudSDK.Users.Get($stateParams.buyerid, userBeingImpersonated.ID)
            .then((user)=>{
                //if user does not have this role they are a limited user
               let isLimitedAdmin = user.AvailableRoles.indexOf('BuyerUserAdmin') < 0;
                let impersonation = {
                    clientID: impersonationClientId
                }
                if(isLimitedAdmin){
                    impersonation.roles = ['AddressReader', 'BuyerReader', 'BuyerUserReader', 'BuyerImpersonation', 'MeAddressAdmin', 'MeAdmin', 'MeXpAdmin', 'OrderReader', 'OrderAdmin','Shopper', 'ShipmentReader'];
                }else{
                    impersonation.roles =['AddressReader', 'BuyerReader', 'BuyerUserReader', 'BuyerUserAdmin', 'BuyerImpersonation', 'MeAddressAdmin', 'MeAdmin', 'MeXpAdmin', 'OrderReader', 'OrderAdmin','Shopper', 'UserGroupAdmin', 'UserGroupReader', 'ShipmentAdmin', 'ShipmentReader']
                } 
                return impersonation;
            })
    }
}