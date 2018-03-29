angular.module('orderCloud')
    .config(AddressesConfig)
;

function AddressesConfig($stateProvider){
    $stateProvider
        .state('addresses', {
            parent: 'buyer',
            templateUrl: 'buyerManagement/addresses/templates/addresses.html',
            controller: 'AddressesCtrl',
            controllerAs: 'addresses',
            url: '/addresses?search&page&pageSize&searchOn&sortBy&filters',
            data: {
                pageTitle: 'Buyer Addresses'
            },
            resolve: {
                Parameters: function($stateParams, ocParameters) {
                    return ocParameters.Get($stateParams);
                },
                CurrentAssignments: function($q, ocAddresses, $stateParams) {
                    return ocAddresses.Assignments.Get('company', $stateParams.buyerid);
                },
                AddressList: function(ocAddresses, OrderCloudSDK, Parameters, CurrentAssignments) {
                    return OrderCloudSDK.Addresses.List(Parameters.buyerid, Parameters)
                        .then(function(data) {
                            return ocAddresses.Assignments.Map(CurrentAssignments, data);
                        });
                }
            }
        })
        .state('userGroup.addresses', {
            templateUrl: 'buyerManagement/addresses/templates/addresses.html',
            controller: 'AddressesCtrl',
            controllerAs: 'addresses',
            url: '/addresses?search&page&pageSize&searchOn&sortBy&filters',
            data: {
                pageTitle: 'User Group Addresses'
            },
            resolve: {
                Parameters: function($stateParams, ocParameters) {
                    return ocParameters.Get($stateParams);
                },
                CurrentAssignments: function($q, ocAddresses, $stateParams) {
                    return ocAddresses.Assignments.Get('group', $stateParams.buyerid, $stateParams.usergroupid);
                },
                AddressList: function(ocAddresses, OrderCloudSDK, Parameters, CurrentAssignments) {
                    return OrderCloudSDK.Addresses.List(Parameters.buyerid, Parameters)
                        .then(function(data) {
                            return ocAddresses.Assignments.Map(CurrentAssignments, data);
                        });
                }
            }
        });
}