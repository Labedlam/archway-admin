angular.module('orderCloud')
    .config(BuyersConfig)
;

function BuyersConfig($stateProvider) {
    $stateProvider
        .state('buyers', {
            parent: 'base',
            url: '/buyers?search&page&pageSize&searchOn&sortBy&filters',
            templateUrl: 'buyerManagement/buyers/templates/buyers.html',
            controller: 'BuyersCtrl',
            controllerAs: 'buyers',
            data: {
                pageTitle: 'Buyer Organizations'
            },
            resolve: {
                Parameters: function($stateParams, ocParameters) {
                    return ocParameters.Get($stateParams);
                },
                BuyerList: function(OrderCloudSDK, Parameters) {
                    return OrderCloudSDK.Buyers.List(Parameters);
                }
            }
        });
}