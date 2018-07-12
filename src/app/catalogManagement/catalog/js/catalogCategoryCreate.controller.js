angular.module('orderCloud')
    .controller('CreateCategoryModalCtrl', CreateCategoryModalController)
;

function CreateCategoryModalController($exceptionHandler, $q, $uibModalInstance, OrderCloudSDK, ParentID, CatalogID, buyerid){
    var vm = this;
    vm.category = {xp:{}};
    vm.category.ParentID = ParentID;
    vm.category.Active = true;
    vm.catalogid = CatalogID;
    vm.buyerid = buyerid;
    vm.chipGridSections = [
        {
            Name: null,
            Columns: 0
        }
    ];
    vm.step = 1;

    vm.fileUploadOptions = {
        keyname: 'image',
        extensions: 'jpg, png, gif, jpeg, tiff',
        uploadText: 'Upload an image',
        replaceText: 'Replace image'
    };

    vm.cancel = function(){
        $uibModalInstance.dismiss();
    };

    vm.submit = function() {
        if (vm.category.ParentID === '') {
            vm.category.ParentID = null;
        }
        
        function createCategory(categoryBody) {
            return OrderCloudSDK.Categories.Create(vm.catalogid, categoryBody)
                .catch(function(ex) {
                    $exceptionHandler(ex);
                });
        }

        function assignClientAdmin(category) {
            return OrderCloudSDK.Categories.SaveAssignment(vm.catalogid, {
                CategoryID: category.ID,
                BuyerID: vm.buyerid,
                UserGroupID: 'client-admin',
                Visible: true,
                ViewAllProducts: true
            });
        }
        
        return createCategory(vm.category).then(categoryData => {
            let createQueue = [];
            if (vm.category.xp.IsChipGrid && vm.chipGridSections.length) {
                _.each(vm.chipGridSections, (section, key) => {
                    let listOrder = key + 1;
                    let chipGridSection = {
                        ParentID: vm.category.ID,
                        ID: `${section.Name.replace(/ /g, '')}_${vm.category.ID}`,
                        Name: section.Name,
                        Active: true,
                        ListOrder: listOrder,
                        xp: {
                            Columns: section.Columns
                        }
                    };
                    createQueue.push(createCategory(chipGridSection));
                });
                return $q.all(createQueue).then(() => {
                    return assignClientAdmin(vm.category).then( ()=> {
                        $uibModalInstance.close(vm.category);
                    });
                });
            } else {
                return assignClientAdmin(vm.category).then( ()=> {
                    $uibModalInstance.close(vm.category);
                });
            }
        });
    };

    vm.switchSections = function() {
        vm.step === 1 ? vm.step ++ : vm.step--; 
    };

    vm.changeSectionCount = function(action, index) {
        if (action === 'add') {
            vm.chipGridSections.push({
                Name: null,
                Columns: 0
            });
        } else {
            vm.chipGridSections.splice(index, 1);
        }
    };
}