angular.module('orderCloud')
    .controller('AppCtrl', AppController)
;

function AppController($state, $ocMedia, OrderCloudSDK, ocStateLoading, ocIsTouchDevice, ocRoles, ocAppName) {
    var vm = this;
    vm.name = ocAppName.Watch;
    vm.$state = $state;
    vm.$ocMedia = $ocMedia;
    vm.isTouchDevice = ocIsTouchDevice;
    vm.stateLoading = ocStateLoading.Watch;
    vm.logout = OrderCloudSDK.Auth.Logout;
    vm.userIsAuthorized = ocRoles.UserIsAuthorized;
}