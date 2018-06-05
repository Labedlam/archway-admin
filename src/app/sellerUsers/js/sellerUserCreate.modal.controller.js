angular.module('orderCloud')
    .controller('SellerUserCreateModalCtrl', SellerUserCreateModalController)
;

function SellerUserCreateModalController($exceptionHandler, $uibModalInstance, OrderCloudSDK, AdminUserGroups) {
    var vm = this;
    vm.user = {Active: true};
    vm.user.xp = {
        UserType: 'ArchwayAdmin'
    };

    vm.submit = function() {
        vm.user.TermsAccepted = new Date();
        vm.loading = OrderCloudSDK.AdminUsers.Create(vm.user)
            .then(function(newAdminUser) { 
                var assignment ={
                    'UserGroupID': AdminUserGroups[0].ID,
                    'UserID': newAdminUser.ID
                    };
                return OrderCloudSDK.AdminUserGroups.SaveUserAssignment(assignment).then(function(){
                    $uibModalInstance.close(newAdminUser);
                });
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };
}