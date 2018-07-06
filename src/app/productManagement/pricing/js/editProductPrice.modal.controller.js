angular.module('orderCloud')
    .controller('EditProductPriceModalCtrl', EditProductPriceModalController)
;

function EditProductPriceModalController($q, $uibModalInstance, OrderCloudSDK, SelectedPriceSchedule, SelectedProduct, IsDefault, ocProductPricing, ExistingAssignments, AssetCollections) {
    var vm = this;
    vm.data = angular.copy(SelectedPriceSchedule);
    vm.priceScheduleName = SelectedPriceSchedule.Name;
    vm.product = SelectedProduct;
    vm.isDefault = IsDefault;
    vm.existingAssignments = ExistingAssignments;
    vm.assetCollections = AssetCollections;
    vm.selected = { value: ExistingAssignments.Items };
    vm.origAssets = angular.copy( vm.selected.value );
    vm.deleteQueue = [];
    vm.createQueue = [];

    vm.listAllAssetCollections = function(search) {
        return OrderCloudSDK.UserGroups.List('ppg', {
            search: search,
            pageSize: 100,
            filters: {'xp.GroupType': 'AssetCollection'}
        })
        .then( data => {
            vm.assetCollections = data;
        });
    };

    vm.submit = function () {
        var previous = {},
            current = {};

        _.each(SelectedPriceSchedule.PriceBreaks, function (pb) {
            previous[pb.Quantity] = pb.Price;
        });

        _.each(vm.data.PriceBreaks, function (pb) {
            current[pb.Quantity] = pb.Price;
        });

        var createQueue = [];
        var deleteQueue = [];

        angular.forEach(current, function (price, quantity) {
            if (!previous[quantity] || (previous[quantity] && previous[quantity] !== price)) {
                createQueue.push(OrderCloudSDK.PriceSchedules.SavePriceBreak(SelectedPriceSchedule.ID, {
                    Quantity: quantity,
                    Price: price
                }));
            }
        });

        angular.forEach(previous, function (price, quantity) {
            if (!current[quantity]) deleteQueue.push(OrderCloudSDK.PriceSchedules.DeletePriceBreak(SelectedPriceSchedule.ID, quantity));
        });

        if (vm.deleteQueue.length) {
            angular.forEach(vm.deleteQueue, function(usergroup) {
                deleteQueue.push(OrderCloudSDK.Products.DeleteAssignment(vm.product.ID, 'ppg', {userGroupID: usergroup.ID}));
            });
        }
        if (vm.createQueue.length) {
            angular.forEach(vm.createQueue, function(usergroup) {
                let assignmentBody = {
                    UserGroupID: usergroup.ID,
                    BuyerID: 'ppg',
                    ProductID: vm.product.ID,
                    PriceScheduleID: vm.data.ID
                };
                createQueue.push(OrderCloudSDK.Products.SaveAssignment(assignmentBody));
            });
        }

        vm.loading = $q.all(createQueue)
            .then(function () {
                return $q.all(deleteQueue)
                    .then(function () {
                        return OrderCloudSDK.PriceSchedules.Update(SelectedPriceSchedule.ID, vm.data)
                            .then(function (updatedPriceSchedule) {
                                ocProductPricing.PriceBreaks.FormatQuantities(updatedPriceSchedule.PriceBreaks);
                                $uibModalInstance.close(updatedPriceSchedule);
                            });
                    });
            });
    };

    vm.deleteAssignment = function(item, model) {
        vm.deleteQueue.push(item);
    };

    vm.saveAssignment = function(item, model) {
        vm.createQueue.push(item);
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss();
    };
}