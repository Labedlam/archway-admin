angular.module('orderCloud')
    .controller('UserCreateModalCtrl', UserCreateModalController)
;

function UserCreateModalController($q, $exceptionHandler, $uibModalInstance, OrderCloudSDK, SelectedBuyerID, AssetCollections) {
    var vm = this;
    vm.user = {Email: '', Password: '', Active: true};
    vm.user.xp = {
        Approved: true
    };
    vm.userTypeOptions = [
        {Name:'Client Admin', Value: 'ClientAdmin'}
    ];
    var userGroupMap = {
        ClientAdmin: 'client-admin'
    };
    vm.user.xp.UserType = 'ClientAdmin';

    vm.submit = function() {
        vm.user.TermsAccepted = new Date();
        vm.loading = {backdrop:false};
            var queue= [];
            vm.loading.promise = OrderCloudSDK.Users.Create(SelectedBuyerID, vm.user)
            .then(function(newUser) {
                var assignment = {UserID: newUser.ID};
                assignment.UserGroupID = userGroupMap[newUser.xp.UserType];
                queue.push( OrderCloudSDK.UserGroups.SaveUserAssignment(SelectedBuyerID, assignment));
                // client admin will need to be assigned to all asset collections.
                _.each(AssetCollections, function(ac){
                    assignment.UserGroupID = ac.ID;
                    queue.push(OrderCloudSDK.UserGroups.SaveUserAssignment(SelectedBuyerID, assignment))
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