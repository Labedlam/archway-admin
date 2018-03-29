angular.module('orderCloud')
    .run(AppRun)
;

function AppRun(ocStateLoading, ocRefreshToken, defaultErrorMessageResolver, ocErrorMessages, validator) {
    ocStateLoading.Init();

    defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
        angular.extend(errorMessages, ocErrorMessages);
    });

    validator.setValidElementStyling(false);
}