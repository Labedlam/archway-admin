angular.module('orderCloud')
    .controller('ProductSpecOptionCreateCtrl', ProductSpecOptionCreateController)
    .controller('ProductSpecOptionEditCtrl', ProductSpecOptionEditController)
;

function ProductSpecOptionCreateController($uibModalInstance, OrderCloudSDK, ProductID, SpecID) {
    var vm = this;
    vm.markupTypes = [
        {Label: 'None', Value: 'NoMarkup'},
        {Label: 'Fixed amount per unit', Value: 'AmountPerQuantity'},
        {Label: 'Fixed amount per line item', Value: 'AmountTotal'},
        {Label: 'Percentage of line total', Value: 'Percentage'}
    ];

    vm.specOption = {
        PriceMarkupType: 'NoMarkup'
    };

    vm.submit = function() {
        vm.loading = OrderCloudSDK.Specs.CreateOption(SpecID, vm.specOption)
            .then(function(data) {
                if (vm.specOption.DefaultOption) {
                    return OrderCloudSDK.Specs.SaveProductAssignment({productID: ProductID, specID: SpecID, defaultOptionID: data.ID})
                        .then(function() {
                            data.DefaultOption = true;
                            $uibModalInstance.close(data);
                        });
                }
                else {
                    data.DefaultOption = false;
                    $uibModalInstance.close(data);
                }
            });
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };
}

function ProductSpecOptionEditController($uibModalInstance, OrderCloudSDK, ProductID, SpecID, SpecOption) {
    var vm = this;
    vm.specOption = angular.copy(SpecOption);
    vm.specOptionValue = angular.copy(SpecOption.Value);
    vm.markupTypes = [
        {Label: 'None', Value: 'NoMarkup'},
        {Label: 'Fixed amount per unit', Value: 'AmountPerQuantity'},
        {Label: 'Fixed amount per line item', Value: 'AmountTotal'},
        {Label: 'Percentage of line total', Value: 'Percentage'}
    ];

    vm.submit = function() {
        var partial = _.pick(vm.specOption, ['ID', 'Value', 'IsOpenText', 'PriceMarkupType', 'PriceMarkup']);
        vm.loading = OrderCloudSDK.Specs.PatchOption(SpecID, SpecOption.ID, partial)
            .then(function(data) {
                if (vm.specOption.DefaultOption && (vm.specOption.DefaultOption != SpecOption.DefaultOption)) {
                    return OrderCloudSDK.Specs.SaveProductAssignment({productID: ProductID, specID: SpecID, defaultOptionID: data.ID})
                        .then(function() {
                            data.DefaultOption = true;
                            data.OriginalID = SpecOption.ID;
                            $uibModalInstance.close(data);
                        });
                }
                else {
                    data.DefaultOption = vm.specOption.DefaultOption;
                    data.OriginalID = SpecOption.ID;
                    $uibModalInstance.close(data);
                }
            });
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };
}