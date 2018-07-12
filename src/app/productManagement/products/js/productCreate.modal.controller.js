angular.module('orderCloud')
    .controller('ProductCreateModalCtrl', ProductCreateModalController);

function ProductCreateModalController($q, $http, $exceptionHandler, $uibModalInstance, $state, imagestorageurl, devapiurl, OrderCloudSDK, catalogid, buyerid) {
    var vm = this;
    vm.catalogID = catalogid;
    vm.buyerID = buyerid;

    vm.product = {
        DefaultPriceSchedule: {
            RestrictedQuantity: false,
            PriceBreaks: [],
            MinQuantity: 1,
            OrderType: 'Standard',
            xp: {}
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
            form: 'image',
            name: 'Product Image'
        }
    ];
    // vm.steps = [{
    //         form: 'info',
    //         name: 'Basic Information'
    //     },
    //     {
    //         form: 'pricing',
    //         name: 'Default Pricing'
    //     },
    //     {
    //         form: 'shipping',
    //         name: 'Shipping Information'
    //     },
    //     {
    //         form: 'inventory',
    //         name: 'Product Inventory'
    //     },
    //     {
    //         form: 'image',
    //         name: 'Product Image'
    //     }
    // ];
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

        if (vm.clientAdminPricing) {
            var priceSchedule = angular.copy(vm.product.DefaultPriceSchedule);
            priceSchedule.Name = vm.product.Name + ' ' + priceSchedule.xp.Currency;
            return OrderCloudSDK.PriceSchedules.Create(priceSchedule)
                .then(function (data) {
                    return _createProduct().then(newProduct => {
                        return _assignToCatalog(newProduct).then( () => {
                            return _assignToClientAdmin(newProduct, data).then( () => {
                                $uibModalInstance.close(newProduct);
                            });
                        });
                    });
                })
                .catch(function (ex) {
                    $exceptionHandler(ex);
                });
        } else {
            return _createProduct().then(newProduct => {
                return _assignToCatalog(newProduct).then( () => {
                    $uibModalInstance.close(newProduct);
                });
            });
        }

        function _createProduct() {
            if (vm.product.xp && vm.product.xp.Keywords.length) vm.product.xp.Keywords = getKeywords();
            if (vm.product.Inventory && !vm.product.Inventory.Enabled) delete vm.product.Inventory;
            return OrderCloudSDK.Products.Update(vm.product.ID, vm.product)
                .then(function (newProduct) {
                    if (vm.product.Image) {
                        let formBody = new FormData();
                        formBody.append('imageUpload', vm.product.Image, vm.product.Image.name);
                        return $http({
                            url: `${devapiurl}/productimage/${newProduct.ID}`,
                            method: 'POST',
                            data: formBody,
                            headers: {
                                'Authorization': `Bearer ${OrderCloudSDK.GetToken()}`,
                                'Content-Type': undefined
                            }
                        }).then(data => {
                            return data.Data;
                        });
                    } else {
                        return newProduct;
                        
                    }
                });   
        }

        function _assignToCatalog(product) {
            return OrderCloudSDK.Catalogs.SaveProductAssignment({
                CatalogID: vm.catalogID,
                ProductID: product.ID
            });
        }

        function _assignToClientAdmin(product, priceSchedule) {
            return OrderCloudSDK.Products.SaveAssignment({
                ProductID: product.ID,
                BuyerID: vm.buyerID,
                UserGroupID: 'client-admin',
                PriceScheduleID: priceSchedule.ID
            });
        }
    }

    function cancel() {
        return $uibModalInstance.dismiss();
    }
}