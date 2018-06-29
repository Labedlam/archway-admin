angular.module('orderCloud')
    .controller('UserCreateModalCtrl', UserCreateModalController)
;

function UserCreateModalController($q, $exceptionHandler, $uibModalInstance, OrderCloudSDK, SelectedBuyerID, AssetCollections) {
    var vm = this;
    vm.user = {
        xp: {
            Approved: true,
            UserType:'ClientAdmin'
        }
    };
    
    var userGroupMap = {
        ClientAdmin: 'client-admin'
    };

    vm.submit = function() {
        vm.user.TermsAccepted = new Date();
        vm.loading = {backdrop:false};
        var queue= [];
        vm.loading.promise = OrderCloudSDK.Users.Create(SelectedBuyerID, vm.user)
            .then(function(newUser) {
                var clientAdminAssignment = {
                    UserGroupID: userGroupMap.ClientAdmin
                };
                AssetCollections.push(clientAdminAssignment);
                _.each(AssetCollections, function(ac){
                    let assignment = {
                        UserGroupID: ac.ID ? ac.ID : ac.UserGroupID,
                        UserID: newUser.ID
                    };
                    queue.push(OrderCloudSDK.UserGroups.SaveUserAssignment(SelectedBuyerID, assignment));
                });
                return $q.all(queue)
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