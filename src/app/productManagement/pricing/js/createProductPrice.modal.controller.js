angular.module('orderCloud')
    .controller('CreateProductPriceModalCtrl', CreateProductPriceModalController);

function CreateProductPriceModalController($exceptionHandler, $uibModalInstance, SelectPriceData, ocProductPricing, OrderCloudSDK) {
    var vm = this;
    if (!SelectPriceData.DefaultPriceSchedule) {
        vm.buyerName = SelectPriceData.Buyer.Name;
        vm.userGroupName = SelectPriceData.UserGroup ? SelectPriceData.UserGroup.Name : null;
        vm.previousPriceSchedule = angular.copy(SelectPriceData.Product.SelectedPrice);
        vm.selectedBuyer = SelectPriceData.Buyer;
        vm.selectedUserGroup = SelectPriceData.UserGroup;
    }
    vm.currencies = [
        'US', 'Canadian'
    ];
    vm.assignedCollections = [];
    vm.product = SelectPriceData.Product;
    vm.priceSchedule = {
        RestrictedQuantity: false,
        PriceBreaks: [],
        MinQuantity: 1,
        OrderType: 'Standard',
        xp: {
            
        }
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss();
    };

    vm.listAllAssetCollections = function(search) {
        return OrderCloudSDK.UserGroups.List(vm.selectedBuyer.ID, {
            search: search,
            pageSize: 100
        })
        .then( data => {
            vm.assetCollections = data;
        });
    };

    vm.submit = function () {
        var userGroups = vm.assignedCollections.length ? vm.assignedCollections : [];
        if (SelectPriceData.DefaultPriceSchedule) vm.priceSchedule.Name = vm.product.Name + ' Default Price';
        vm.loading = ocProductPricing.CreatePrice(vm.product, vm.priceSchedule, vm.selectedBuyer, userGroups, SelectPriceData.DefaultPriceSchedule)
            .then(function (data) {
                $uibModalInstance.close({
                    SelectedPrice: data.NewPriceSchedule,
                    UpdatedAssignments: SelectPriceData.CurrentAssignments
                });
            })
            .catch(function (ex) {
                $exceptionHandler(ex);
            });
    };
}