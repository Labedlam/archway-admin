angular.module('orderCloud')
    .controller('UserEditModalCtrl', UserEditModalController)
;


function UserEditModalController($exceptionHandler, $uibModalInstance, OrderCloudSDK, SelectedUser, SelectedBuyerID) {
    var vm = this;
    vm.user = angular.copy(SelectedUser);
    vm.username = SelectedUser.Username;
    vm.fullName = SelectedUser.FirstName ? (SelectedUser.FirstName + (SelectedUser.LastName ? ' ' + SelectedUser.LastName : '')) : (SelectedUser.LastName ? SelectedUser.LastName : null);
    vm.userTypeOptions = [
        {Name:'Client Admin', Value: 'ClientAdmin'},
        {Name:'Archway Admin', Value: 'ArchwayAdmin'}
    ];
    var userGroupMap = {
        ClientAdmin: 'client-admin',
        ArchwayAdmin: 'archway-admin'
    };


    if (vm.user.TermsAccepted != null) {
        vm.TermsAccepted = true;
    }
    

    vm.submit = function() {
        if(vm.user.xp.UserType !== SelectedUser.xp.UserType) var updateAssignments = true;
        var today = new Date();
        vm.user.TermsAccepted = today;
        vm.loading = {backdrop:false};
        vm.loading.promise = OrderCloudSDK.Users.Update(SelectedBuyerID, SelectedUser.ID, vm.user)
            .then(function(updatedUser) {
                if(updateAssignments){
                    return OrderCloudSDK.UserGroups.DeleteUserAssignment(SelectedBuyerID, userGroupMap[SelectedUser.xp.UserType], vm.user.ID)
                        .then(function(){
                            var assignment = {UserID: vm.user.ID};
                            assignment.UserGroupID = userGroupMap[vm.user.xp.UserType];
                            return OrderCloudSDK.UserGroups.SaveUserAssignment(SelectedBuyerID, assignment)
                                .then(function(){
                                    $uibModalInstance.close(vm.user);
                                });
                        });
                }else{
                    $uibModalInstance.close(updatedUser);
                }
                
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };
}
