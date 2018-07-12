angular.module('orderCloud')
    .controller('ProductCtrl', ProductController);

function ProductController($exceptionHandler, $rootScope, $state, toastr, imagestorageurl, OrderCloudSDK, ocProducts, ocNavItems, ocRelatedProducts, ocProductPricing, SelectedProduct) {
    var vm = this;
    vm.model = angular.copy(SelectedProduct);
    vm.productName = angular.copy(SelectedProduct.Name);
    vm.inventoryEnabled = angular.copy(SelectedProduct.Inventory ? SelectedProduct.Inventory.Enabled : false);
    vm.updateProduct = updateProduct;
    vm.deleteProduct = deleteProduct;
    vm.createDefaultPrice = createDefaultPrice;
    vm.defaultImage = vm.model.xp && vm.model.xp.Images && vm.model.xp.Images.length ? `${imagestorageurl}${vm.model.xp.Images[0].StorageName}` : '';
    if (!vm.model.xp.Images || !vm.model.xp.Images.length) vm.model.xp.Images = [{}];
    
    vm.navigationItems = ocNavItems.Filter(ocNavItems.Product());
    vm.state = $state.current.name;
    vm.fileUploadOptions = {
        keyname: 'Images',
        src: imagestorageurl,
        folder: null,
        extensions: 'jpg, png, gif, jpeg, tiff',
        invalidExtensions: null,
        onUpdate: null,
        multiple: false,
        addText: 'Upload an image',
        replaceText: 'Replace'
    };

    vm.descriptionToolbar = [
        ['html', 'bold', 'italics', 'underline', 'strikeThrough'],
        ['h1', 'h2', 'h3', 'p'],
        ['ul', 'ol'],
        ['insertLink', 'insertImage', 'insertVideo']
    ];

    vm.setKeywords = _setKeywords;
    
    function _setKeywords(){
        if(vm.model.xp && vm.model.xp.Keywords){
           vm.keywords = _.map(vm.model.xp.Keywords, function(keyword){
            return { text : keyword}; 
           });
        }else{
            if(!vm.model.xp)vm.model.xp = { };
            vm.model.xp.Keywords = [];
            vm.keywords  = []; 
        }
    }

    function getKeywords (){
        //returns an array of keywords
        return _.map(vm.keywords, function(keyword){
            return keyword.text;    
        });
    }

    function updateProduct() {
        var currentPrice = angular.copy(vm.model.DefaultPriceSchedule);
        var partial = _.pick(vm.model, ['ID', 'Name', 'Description', 'QuantityMultiplier', 'Inventory', 'Active']);
        var partialXP = _.pick(vm.model.xp, ['Featured', 'ApprovalRequired', 'Brand', 'Keywords', 'Comments', 'UnitOfMeasure', 'Images']);
        partial.xp = partialXP;
        partial.xp.Keywords = getKeywords();
        
        vm.loading = OrderCloudSDK.Products.Patch(SelectedProduct.ID, partial)
            .then(function (data) {

                //Account for changes in ID
                if (data.ID !== SelectedProduct.ID) {
                    $state.go('.', {productid: data.ID}, {notify: false});

                    //Sync other products that have this product in xp.RelatedProducts array
                    //This only makes API calls if the product has related products
                    ocRelatedProducts.Sync(data.xp.RelatedProducts, data.ID, SelectedProduct.ID);
                }

                //Update the view model
                vm.model = angular.copy(data);
                if (currentPrice && data.Name !== SelectedProduct.Name) {
                    OrderCloudSDK.PriceSchedules.Patch(currentPrice.ID, {
                            Name: data.Name + ' Default Price'
                        })
                        .then(function (updatedPrice) {
                            vm.model.DefaultPriceSchedule = updatedPrice;
                        });
                } else {
                    vm.model.DefaultPriceSchedule = currentPrice;
                }


                vm.productName = angular.copy(data.Name);
                vm.inventoryEnabled = angular.copy(data.InventoryEnabled);
                SelectedProduct = data;
                vm.form.$setPristine();
                toastr.success(data.Name + ' was updated');
            });
    }

    function deleteProduct() {
        ocProducts.Delete(SelectedProduct)
            .then(function () {
                toastr.success(SelectedProduct.Name + ' was deleted.');
                $state.go('products', {}, {
                    reload: true
                });
            });
    }

    function createDefaultPrice() {
        ocProductPricing.CreateProductPrice(vm.model, null, null, null, true)
            .then(function (data) {
                toastr.success('Default price was successfully added to ' + vm.model.Name);
                $state.go('product.pricing.priceScheduleDetail', {
                    pricescheduleid: data.SelectedPrice.ID
                }, {
                    reload: true
                });
            });
    }


    $rootScope.$on('OC:DefaultPriceUpdated', function (event, newID) {
        vm.model.DefaultPriceScheduleID = newID;
    });
}