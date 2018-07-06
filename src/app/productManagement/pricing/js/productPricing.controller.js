angular.module('orderCloud')
    .controller('ProductPricingCtrl', ProductPricingController)
;

function ProductPricingController($state, $rootScope, $stateParams, $uibModal, toastr, AssignmentList, AssignmentData, ocProductPricing, ocConfirm, SelectedProduct) {
    var vm = this;
    vm.list = AssignmentList;
    vm.listAssignments = AssignmentData;
    vm.noPricesSet = _.keys(vm.listAssignments).length === 0;
    vm.product = SelectedProduct;
    var isDefault;

    vm.selectPrice = function (scope) {
        vm.loadingPrice = ocProductPricing.AssignmentDataDetail(vm.listAssignments, scope.assignment.PriceSchedule.ID)
            .then(function (data) {
                vm.selectedPrice = scope.assignment;
                vm.selectedPrice.PriceSchedule = data.PriceSchedule;
                vm.selectedPrice.Availability = data.Buyers;
                isDefault = vm.product.DefaultPriceScheduleID === data.PriceSchedule.ID;
            });
    };

    if (vm.product.DefaultPriceScheduleID && !$stateParams.pricescheduleid) {
        vm.selectPrice({
            assignment: vm.listAssignments[vm.product.DefaultPriceScheduleID]
        });
    } else if ($stateParams.pricescheduleid && vm.listAssignments[$stateParams.pricescheduleid]) {
        vm.selectPrice({
            assignment: vm.listAssignments[$stateParams.pricescheduleid]
        });
    } else if (_.keys(vm.listAssignments).length) {
        vm.selectPrice({
            assignment: vm.listAssignments[_.keys(vm.listAssignments)[0]]
        });
    }
    

    vm.editPrice = function () {
        ocProductPricing.EditProductPrice(vm.selectedPrice.PriceSchedule, isDefault, vm.product)
            .then(function (updatedPriceSchedule) {
                if (isDefault && updatedPriceSchedule.ID !== vm.selectedPrice.PriceSchedule.ID) $rootScope.$broadcast('OC:DefaultPriceUpdated', updatedPriceSchedule.ID);
                var oldAssignment = angular.copy(vm.listAssignments[vm.selectedPrice.PriceSchedule.ID]);
                oldAssignment.PriceSchedule = updatedPriceSchedule;
                oldAssignment.PriceScheduleID = updatedPriceSchedule.ID;

                delete vm.listAssignments[vm.selectedPrice.PriceSchedule.ID];

                vm.listAssignments[updatedPriceSchedule.ID] = oldAssignment;
                vm.selectedPrice = oldAssignment;
                vm.selectedPrice.PriceSchedule = updatedPriceSchedule;
                toastr.success(vm.selectedPrice.PriceSchedule.Name + ' was updated.');
                $state.go('product.pricing', {productid: vm.product.ID}, {reload: true});
            });
    };

    vm.deletePrice = function () {
        ocProductPricing.DeletePrice(vm.selectedPrice.PriceSchedule)
            .then(function () {
                delete vm.listAssignments[vm.selectedPrice.PriceSchedule.ID];
                vm.noPricesSet = _.keys(vm.listAssignments).length === 0;
                toastr.success(vm.selectedPrice.PriceSchedule.Name + ' was deleted');
                vm.selectedPrice = null;
            });
    };

    vm.createPrice = function() {
        let availability = vm.selectedPrice ? vm.selectedPrice.Availability[0] : {};
        return ocProductPricing.CreateProductPrice(vm.product, availability, vm.listAssignments)
            .then( () => {
                $state.go('product.pricing', {productid: vm.product.ID}, {reload: true});
            });
    };
}