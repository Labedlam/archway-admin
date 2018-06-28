angular.module('orderCloud')
    .controller('FileUploadModalCtrl', FileUploadModalController)
;

function FileUploadModalController($http, $timeout, devapiurl, OrderCloudSDK, $uibModalInstance, imagestorageurl, FileUploadOptions, CurrentValue, Product) {
    var vm = this;
    vm.additionalFields = angular.copy(FileUploadOptions.additionalFields);
    vm.invalidExtension = false;
    vm.options = FileUploadOptions;
    vm.product = Product;
    vm.model = angular.copy(CurrentValue);
    vm.defaultImage = !_.isEmpty(vm.model) ? `${imagestorageurl}${vm.model.StorageName}` : null;

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
        $timeout(function(){
            vm.file = event.target.files[0];
        }(), 100);

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
            return;
        } else {
            vm.invalidExtension = true;
            var input;
            event.target.files[0] = null;
            input = $('#orderCloudUpload').find('input').clone(true);
            $('#orderCloudUpload').find('input').replaceWith(input);
            return;
        }
    }

    vm.submit = function() {
        if (vm.options.action === 'create') {
            if (vm.product.xp.Keywords && vm.product.xp.Keywords.length) vm.product.xp.Keywords = _.map(vm.product.xp.Keywords, 'text');
            return $uibModalInstance.close(vm.file);
        } else {
            vm.product.xp.Images = [];
            vm.loading = OrderCloudSDK.Products.Patch( vm.product.ID, { xp: vm.product.xp } ).then( prod => {
                return postImage(prod);
            });
        }

        function postImage(product) {
            let formBody = new FormData();
            formBody.append('imageUpload', vm.file, vm.file.name);
            return $http({
                url: `${devapiurl}/productimage/${product.ID}`,
                method: 'POST',
                data: formBody,
                headers: {
                    'Authorization': `Bearer ${OrderCloudSDK.GetToken()}`,
                    'Content-Type': undefined
                }
            }).then(data => {
                return $uibModalInstance.close(data.data);
            });
        }
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };
}