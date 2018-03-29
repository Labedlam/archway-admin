angular.module('orderCloud')
    .config(function($qProvider, $provide) {
        //Error Handling
        $provide.value('ocErrorMessages', {
            customPassword: 'Password must be at least eight characters long and include at least one letter and one number. Password can also include special characters.',
            ocMatchPassword: 'Passwords do not match.',
            positiveInteger: 'Please enter a positive integer',
            ID_Name: 'Only Alphanumeric characters, hyphens and underscores are allowed',
            noSpecialChars: 'Only Alphanumeric characters are allowed',
            'UnavailableID': 'This ID is already in use.',
            'User.UsernameMustBeUnique': 'This username is already in use.',
            'step': 'Please enter a valid dollar amount.',
            'priceBreakRequired': 'At least one price break is required.',
            'priceBreakExceedsMaxQuantity': 'Must be less than the maximum quantity.',
            'priceBreakQuantityConflict': 'This quantity already has a price.',
            'priceBreakStartingQuantity': 'First price break must equal the minimum quantity.',
            'priceBreakOtherQuantity': 'Must be greater than the minimum quantity.'
        });

        $provide.decorator('$exceptionHandler', handler);
        $qProvider.errorOnUnhandledRejections(false); //Stop .catch validation from angular v1.6.0
        function handler($delegate, $injector) { //Catch all for unhandled errors
            return function(ex, cause) {
                var message = '';
                if(ex && ex.response && ex.response.body && ex.response.body.Errors && ex.response.body.Errors.length) {
                    message = ex.response.body.Errors[0].Message;
                } else if(ex && ex.response && ex.response.body && ex.response.body['error_description']) {
                    message = ex.response.body['error_description'];
                } else if(ex.message) {
                    message = ex.message;
                } else {
                    message = 'An error occurred';
                }
                $delegate(ex, cause);
                $injector.get('toastr').error(message, 'Error');
            };
        }
    })
;

