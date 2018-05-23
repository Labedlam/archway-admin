angular.module('orderCloud')
    .directive('ocFileUpload', ordercloudFileUpload)
;

function ordercloudFileUpload($uibModal, $ocFiles, $resource, devapiurl, OrderCloudSDK, ocConfirm, imagestorageurl) {
    var directive = {
        scope: {
            model: '<fileUploadModel',
            options: '<fileUploadOptions',
            product: '='
        },
        restrict: 'E',
        require: '^?ocPrettySubmit',
        template: '<div ng-include="fileUploadTemplate"></div>',
        replace: true,
        link: link
    };

    function link(scope, element, attrs, formCtrl) {
        scope.imagestorageurl = imagestorageurl;
        // if (!ocFiles.Enabled()) return;
        (function mergeOptions() {
            var globalOptions = $ocFiles.GetFileUploadOptions();
            scope.fileUploadOptions = scope.options ?  _.merge({}, globalOptions, scope.options) : globalOptions;
            scope.fileUploadTemplate = scope.fileUploadOptions.multiple ? 'common/directives/oc-file-upload/templates/oc-files-upload.html' : 'common/directives/oc-file-upload/templates/oc-file-upload.html';
            scope.model ? scope.fileUploadModel = angular.copy(scope.model) : scope.fileUploadModel = [];
        })();

        scope.openModal = function(index) {
            $uibModal.open({
                templateUrl: 'common/directives/oc-file-upload/templates/oc-file-upload.modal.html',
                controller: 'FileUploadModalCtrl',
                controllerAs: 'fileUploadModal',
                size: 'lg',
                resolve: {
                    CurrentValue: function() {
                        return scope.fileUploadOptions.multiple ? (index > -1 ? scope.fileUploadModel[scope.fileUploadOptions.keyname][index] : {}) : scope.fileUploadModel[scope.fileUploadOptions.keyname][0];
                    },
                    FileUploadOptions: function() {
                        return scope.fileUploadOptions;
                    },
                    Product: function() {
                        return scope.product;
                    }
                }
            }).result.then(function(data) {
                if (scope.fileUploadOptions.multiple) {
                    index > -1 
                        ? (scope.fileUploadModel[index] = data) 
                        : scope.fileUploadModel[scope.fileUploadOptions.keyname] ? scope.fileUploadModel[scope.fileUploadOptions.keyname].push(data) : scope.fileUploadModel[scope.fileUploadOptions.keyname] = [data];
                } else {
                    scope.fileUploadModel[scope.fileUploadOptions.keyname] = data;
                }
                callOnUpdate();
                dirtyModel();
            });
        };

        scope.addImage = function() {
            if (!scope.fileUploadOptions.multiple) return;
            scope.openModal(-1);
        };

        scope.fileUploadModelCopy = angular.copy(scope.fileUploadModel);
        scope.dropped = function(index) {
            scope.fileUploadModel[scope.fileUploadOptions.keyname].splice(index, 1);
            callOnUpdate();
            scope.fileUploadModelCopy = angular.copy(scope.fileUploadModel);
        };

        scope.removeFile = function(index) {
            ocConfirm.Confirm({
                message: 'Are you sure you want to delete this file?',
                confirmText: 'Delete file',
                type: 'delete'})
                .then(function() {
                    if (scope.fileUploadOptions.multiple) {
                        if (scope.fileUploadModel && scope.fileUploadModel[scope.fileUploadOptions.keyname] && scope.fileUploadModel[scope.fileUploadOptions.keyname] && scope.fileUploadModel[scope.fileUploadOptions.keyname][index]) {
                            scope.fileUploadModel[scope.fileUploadOptions.keyname].splice(index, 1);
                        }
                    }
                    else {
                        if (scope.fileUploadModel && scope.fileUploadModel[scope.fileUploadOptions.keyname]) scope.fileUploadModel[scope.fileUploadOptions.keyname] = null;
                    }

                    callOnUpdate();
                    dirtyModel();
                });
        };

        function callOnUpdate() {
            let body = {
                
            };
            //URL will look like this: `${devapiurl}/${scope.fileUploadModel[i].StorageName}/api/productimage/${productid}`
            return $resource( `${devapiurl}/productimage/`, {}, { send: { method: 'POST', headers: { 'Authorization': `Bearer ${OrderCloudSDK.GetToken()}` } } } ).send( body ).$promise.then( () =>{
                initModelValue();
            });
            // if (scope.fileUploadOptions.onUpdate && (typeof scope.fileUploadOptions.onUpdate == 'function')) scope.fileUploadOptions.onUpdate(scope.fileUploadModel);
        }

        function dirtyModel() {
            if (formCtrl && formCtrl.setDirty) formCtrl.setDirty();
        }
    }

    return directive;
}

