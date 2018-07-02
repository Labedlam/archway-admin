angular.module('orderCloud')
    .controller('LoginCtrl', LoginController);

function LoginController($state, $exceptionHandler, $location, hostedsiteurl, ocRoles, OrderCloudSDK, scope, clientid, $window) {
    var vm = this;
    vm.credentials = {
        Username: null,
        Password: null
    };
    vm.rememberStatus = false;
    vm.form = 'login';
    
    vm.verificationCode = $state.params.verificationCode;
    
    vm.setForm = function (form) {  
        vm.form = form;
    };
    
    vm.verificationCode ? vm.setForm( 'reset' ) : vm.setForm( 'login' );
    
    vm.submit = function () {
        vm.loading = OrderCloudSDK.Auth.Login(vm.credentials.Username, $window.encodeURIComponent(vm.credentials.Password), clientid, scope)
            .then(function (data) {
                OrderCloudSDK.SetToken(data.access_token);
                if (vm.rememberStatus && data['refresh_token']) OrderCloudSDK.SetRefreshToken(data['refresh_token']);
                var roles = ocRoles.Set(data.access_token);
                if (roles.length === 1 && roles[0] === 'PasswordReset') {
                    vm.token = data.access_token;
                    vm.form = 'resetByToken';
                } else {
                    $state.go('home');
                }
            })
            .catch(function (ex) {
                $exceptionHandler(ex);
            });
    };

    vm.forgotPassword = function () {
        vm.loading = OrderCloudSDK.PasswordResets.SendVerificationCode({
                Email: vm.credentials.Email,
                ClientID: clientid,
                URL: hostedsiteurl || $location.absUrl().split( '/login' )[ 0 ]
            })
            .then(function () {
                vm.setForm('login');
                vm.loginMessage = 'An email has been sent to ' + vm.credentials.Email + ' with a link to reset your password';
                vm.credentials.Email = null;
            })
            .catch(function (ex) {
                $exceptionHandler(ex);
            });
    };

    vm.resetPasswordByToken = function () {
        vm.loading = OrderCloudSDK.Me.ResetPasswordByToken({
                NewPassword: vm.credentials.NewPassword
            })
            .then(function () {
                vm.setForm('resetSuccess');
                vm.credentials = {
                    Username: null,
                    Password: null
                };
            })
            .catch(function (ex) {
                $exceptionHandler(ex);
            });
    };

    vm.resetPassword = function () {
        vm.loading = OrderCloudSDK.PasswordResets.ResetPasswordByVerificationCode(vm.verificationCode, {
                ClientID: clientid,
                Username: vm.credentials.ResetUsername,
                Password: vm.credentials.NewPassword
            })
            .then(function () {
                vm.setForm('resetSuccess');
                vm.credentials.ResetUsername = null;
                vm.credentials.NewPassword = null;
                vm.credentials.ConfirmPassword = null;
            })
            .catch(function (ex) {
                $exceptionHandler(ex);
                vm.credentials.ResetUsername = null;
                vm.credentials.NewPassword = null;
                vm.credentials.ConfirmPassword = null;
            });
    };
}