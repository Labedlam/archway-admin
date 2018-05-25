angular.module('orderCloud')
    .controller('UserCreateModalCtrl', UserCreateModalController)
;

function UserCreateModalController($exceptionHandler, $uibModalInstance, OrderCloudSDK, SelectedBuyerID) {
    var vm = this;
    vm.user = {Email: '', Password: '', Active: true};
    vm.user.xp = {
        Approved: true
    };
    vm.userTypeOptions = [
        {Name:'Client Admin', Value: 'ClientAdmin'},
        {Name:'Archway Admin', Value: 'ArchwayAdmin'}
    ];
    var userGroupMap = {
        ClientAdmin: 'client-admin',
        ArchwayAdmin: 'archway-admin'
    };

    vm.submit = function() {
        vm.user.TermsAccepted = new Date();

        vm.loading = {backdrop:false};
        vm.loading.promise = OrderCloudSDK.Users.Create(SelectedBuyerID, vm.user)
            .then(function(newUser) {
                var assignment = {UserID: newUser.ID};
                assignment.UserGroupID = userGroupMap[newUser.xp.UserType];
                return OrderCloudSDK.UserGroups.SaveUserAssignment(SelectedBuyerID, assignment)
                    .then(function(){
                        $uibModalInstance.close(newUser);
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