angular.module('orderCloud')
    .controller('ProductCreateModalCtrl', ProductCreateModalController);

function ProductCreateModalController($q, $http, $exceptionHandler, $uibModalInstance, $state, imagestorageurl, devapiurl, OrderCloudSDK) {
    var vm = this;   

    vm.product = {
        DefaultPriceSchedule: {
            RestrictedQuantity: false,
            PriceBreaks: [],
            MinQuantity: 1,
            OrderType: 'Standard'
        },
        xp: {
            Images: []
        },
        Active: true,
        QuantityMultiplier: 1
    };
    vm.steps = [{
            form: 'info',
            name: 'Basic Information'
        },
        {
            form: 'pricing',
            name: 'Default Pricing'
        },
        {
            form: 'shipping',
            name: 'Shipping Information'
        },
        {
            form: 'inventory',
            name: 'Product Inventory'
        },
        {
            form: 'image',
            name: 'Product Image'
        }
    ];
    vm.currentStep = 0;
    vm.showNext = true;
    vm.initialized = true;

    vm.nextStep = function () {
        vm.currentStep++;
        _checkPrevNex();
    };

    vm.prevStep = function () {
        vm.currentStep--;
        _checkPrevNex();
    };

    function _checkPrevNex() {
        vm.showNext = vm.currentStep < vm.steps.length - 1;
        vm.showPrev = vm.currentStep > 0;
    }

    vm.submit = submit;
    vm.cancel = cancel;

    vm.listAllAdminAddresses = listAllAdminAddresses;

    vm.fileUploadOptions = {
        keyname: 'Images',
        src: imagestorageurl,
        folder: null,
        extensions: 'jpg, png, gif, jpeg, tiff',
        invalidExtensions: null,
        onUpdate: null,
        multiple: false,
        addText: 'Upload an image',
        replaceText: 'Replace',
        action: 'create'
    };

    function listAllAdminAddresses(search) {
        return OrderCloudSDK.AdminAddresses.List({
                search: search
            })
            .then(function (data) {
                vm.sellerAddresses = data;
            });
    }

    vm.createSellerAddress = function() {
        $uibModalInstance.dismiss();
        $state.go('sellerAddresses');
    };

    function getKeywords() {
        //returns an array of keywords
        return _.map(vm.product.xp.Keywords, function(keyword) {
            return keyword.text;
        });
        
    }

    function submit() {
        var df = $q.defer();
        vm.loading = df.promise;

        if (vm.enableDefaultPricing) {
            var priceSchedule = angular.copy(vm.product.DefaultPriceSchedule);
            priceSchedule.Name = vm.product.Name + ' Default Price';
            OrderCloudSDK.PriceSchedules.Create(priceSchedule)
                .then(function (data) {
                    vm.product.DefaultPriceScheduleID = data.ID;
                    _createProduct();
                })
                .catch(function (ex) {
                    $exceptionHandler(ex);
                });
        } else {
            _createProduct();
        }

        function _createProduct() {
            if (vm.product.xp && vm.product.xp.Keywords.length) vm.product.xp.Keywords = getKeywords();
            if (vm.product.Inventory && !vm.product.Inventory.Enabled) delete vm.product.Inventory;
            OrderCloudSDK.Products.Update(vm.product.ID, vm.product)
                .then(function (data) {
                    if (vm.product.Image) {
                        let formBody = new FormData();
                        formBody.append('imageUpload', vm.product.Image, vm.product.Image.name);
                        return $http({
                            url: `${devapiurl}/productimage/${data.ID}`,
                            method: 'POST',
                            data: formBody,
                            headers: {
                                'Authorization': `Bearer ${OrderCloudSDK.GetToken()}`,
                                'Content-Type': undefined
                            }
                        }).then(data => {
                            return $uibModalInstance.close(data.data);
                        });
                    } else {
                        $uibModalInstance.close(data);
                    }
                });
            
        }
    }

    function cancel() {
        return $uibModalInstance.dismiss();
    }
}