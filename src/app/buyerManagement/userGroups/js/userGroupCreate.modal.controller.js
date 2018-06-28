angular.module('orderCloud')
    .controller('UserGroupCreateModalCtrl', UserGroupCreateModalController)
;

function UserGroupCreateModalController($uibModalInstance, $exceptionHandler, OrderCloudSDK, SelectedBuyerID) {
    var vm = this;
    vm.groupTypes =  [{Name: 'Asset Collection', Value:'AssetCollection'}, {Name:'Rep Group', Value:'Reps'}];
    vm.userGroup ={xp: {}};
    vm.regions = ['US', 'CA'];
    vm.submit = function() {
        vm.loading = OrderCloudSDK.UserGroups.Create(SelectedBuyerID, vm.userGroup)
            .then(function(data) {
                $uibModalInstance.close(data);
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };
}