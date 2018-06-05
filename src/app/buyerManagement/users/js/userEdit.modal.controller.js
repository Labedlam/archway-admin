angular.module('orderCloud')
    .controller('UserEditModalCtrl', UserEditModalController)
;


function UserEditModalController($exceptionHandler, $uibModalInstance, OrderCloudSDK, SelectedUser, SelectedBuyerID) {
    var vm = this;
    vm.user = angular.copy(SelectedUser);
    vm.username = SelectedUser.Username;
    vm.fullName = SelectedUser.FirstName ? (SelectedUser.FirstName + (SelectedUser.LastName ? ' ' + SelectedUser.LastName : '')) : (SelectedUser.LastName ? SelectedUser.LastName : null);
    vm.userTypeOptions = [
        {Name:'Client Admin', Value: 'ClientAdmin'}
    ];

    if (vm.user.TermsAccepted != null) {
        vm.TermsAccepted = true;
    }

    vm.submit = function() {

        var today = new Date();
        vm.user.TermsAccepted = today;
        vm.loading = {backdrop:false};
        vm.loading.promise = OrderCloudSDK.Users.Update(SelectedBuyerID, SelectedUser.ID, vm.user)
            .then(function(updatedUser) {
                    $uibModalInstance.close(updatedUser);
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };
}
