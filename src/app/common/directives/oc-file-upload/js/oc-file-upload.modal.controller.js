angular.module('orderCloud')
    .controller('FileUploadModalCtrl', FileUploadModalController)
;

function FileUploadModalController($resource, $http, devapiurl, OrderCloudSDK, $uibModalInstance, imagestorageurl, FileUploadOptions, CurrentValue, Product) {
    var vm = this;
    vm.additionalFields = angular.copy(FileUploadOptions.additionalFields);
    vm.invalidExtension = false;
    vm.options = FileUploadOptions;
    vm.product = Product;
    vm.model = angular.copy(CurrentValue);
    vm.defaultImage = `${imagestorageurl}${vm.model.StorageName}`;

    var allowed = parseExtensions(FileUploadOptions.extensions);
    var notAllowed = parseExtensions(FileUploadOptions.invalidExtensions);
    function parseExtensions(extensions) {
        var result = {
            Extensions: [],
            Types: []
        };
        if (!extensions) return result;
        var items = _.map(extensions.split(','), function(ext) {
            return ext.replace(/ /g, '').replace(/\./g, '').toLowerCase();
        });
        angular.forEach(items, function(item) {
            if (item.indexOf('/') > -1) {
                if (item.indexOf('*') > -1) {
                    result.Types.push(item.split('/')[0]);
                }
                else {
                    result.Extensions.push(item.split('/')[1]);
                }
            }
            else {
                result.Extensions.push(item);
            }
        });
        return result;
    }

    vm.upload = function() {
        $('#orderCloudUpload').click();
    };

    angular.element(document).ready(filInputInit);

    function filInputInit() {
        $('#orderCloudUpload').bind('change', updateModel);
    }

    function updateModel(event) {
        if (event.target.files[0] === null) return;
        var fileName = event.target.files[0].name, 
            valid = true, 
            ext;

        if ((allowed.Extensions.length || allowed.Types.length) && fileName) {
            ext = fileName.split('.').pop().toLowerCase();
            valid = (allowed.Extensions.indexOf(ext) !== -1 || allowed.Types.indexOf(event.target.files[0].type.split('/')[0]) > -1);
        }
        if ((notAllowed.Extensions.length || notAllowed.Types.length) && fileName) {
            ext = fileName.split('.').pop().toLowerCase();
            valid = (notAllowed.Extensions.indexOf(ext) === -1 && notAllowed.Types.indexOf(event.target.files[0].type.split('/')[0]) === -1);
        }
        if (valid) {
            vm.invalidExtension = false;
            //TEST: 01215554
            // let body = `name="imageUpload";filename="${event.target.files[0].name}"`;
            let formBody = new FormData();
            formBody.append('imageUpload', event.target.files[0], event.target.files[0].name);
            // return $resource( 
            //     `${devapiurl}/productimage/${vm.product.ID}`, 
            //     {}, 
            //     { 
            //         send: { 
            //             method: 'POST', 
            //             headers: { 
            //                 'Authorization': `Bearer ${OrderCloudSDK.GetToken()}`,
            //                 'Content-Type': 'multipart/form-data;boundry=""'
            //             }
            //         } 
            //     } ).send( formBody ).$promise.then( data => {
            //     console.log('data', data);
            // });


            return $http({
                url: `${devapiurl}/productimage/${vm.product.ID}`,
                method: 'POST',
                data: formBody,
                headers: {
                    'Authorization': `Bearer ${OrderCloudSDK.GetToken()}`,
                    'Content-Type': undefined
                }
            }).then(data => {
                console.log('data', data);
            });
        } else {
            vm.invalidExtension = true;
            var input;
            event.target.files[0] = null;
            input = $('#orderCloudUpload').find('input').clone(true);
            $('#orderCloudUpload').find('input').replaceWith(input);
        }
    }

    vm.submit = function() {
        $uibModalInstance.close(vm.model);
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };
}