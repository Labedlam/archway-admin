angular.module('orderCloud')
    .controller('CreateCategoryModalCtrl', CreateCategoryModalController)
;

function CreateCategoryModalController($exceptionHandler, $uibModalInstance, OrderCloudSDK, ParentID, CatalogID){
    var vm = this;
    vm.category = {xp:{}};
    vm.category.ParentID = ParentID;
    vm.category.Active = true;
    vm.catalogid = CatalogID;
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

    vm.submit = function(gridSection) {
        if (vm.category.ParentID === '') {
            vm.category.ParentID = null;
        }
        let categoryBody = gridSection ? gridSection : vm.category;
        vm.loading = OrderCloudSDK.Categories.Create(vm.catalogid, categoryBody)
            .then(function(category) {
                if (vm.category.xp.IsChipGrid && vm.chipGridSections[0].Name && vm.chipGridSections[0].Columns) {
                    _.each(vm.chipGridSections, section => {
                        section.ParentID = vm.category.ID;
                        section.xp = {
                            Columns: section.Columns
                        };
                        vm.submit(section);
                    });
                } else {
                    $uibModalInstance.close(category);
                }
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.switchSections = function() {
        vm.step === 1 ? vm.step ++ : vm.step--; 
    };
}