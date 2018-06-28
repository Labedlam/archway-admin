angular.module('orderCloud')
    .controller('UserEditModalCtrl', UserEditModalController)
;


function UserEditModalController( $q, $exceptionHandler, $uibModalInstance, OrderCloudSDK, SelectedUser, SelectedBuyerID, Addressess) {
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
                    if(vm.user.xp.SAP !== SelectedUser.xp.SAP){
                        var addressUpdateQueue = [];
                        _.each(Addressess.Items, (address) => {
                            addressUpdateQueue.push(OrderCloudSDK.As().Me.PatchAddress(address.ID, {'xp.SAP': vm.user.xp.SAP}))
                        });
                        return $q.all(addressUpdateQueue).then(() => vm.close(updatedUser));
                    }else{
                        vm.close(updatedUser);
                    }
                    
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };
    vm.close = function(sendBack){
        OrderCloudSDK.RemoveImpersonationToken();
        $uibModalInstance.close(sendBack);
    }

    vm.cancel = function() {
        OrderCloudSDK.RemoveImpersonationToken();
        $uibModalInstance.dismiss();
    };
}
