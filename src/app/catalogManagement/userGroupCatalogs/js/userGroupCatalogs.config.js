angular.module('orderCloud')
    .config(UserGroupCatalogsConfig)
;

function UserGroupCatalogsConfig($stateProvider) {
    $stateProvider
        .state('userGroupCatalogs', {
            parent: 'userGroup',
            url: '/catalogs?search&page&pageSize&searchOn&sortBy&filters',
            templateUrl: 'catalogManagement/userGroupCatalogs/templates/userGroupCatalogs.html',
            controller: 'UserGroupCatalogsCtrl',
            controllerAs: 'userGroupCatalogs',
            data: {
                pageTitle: 'User Group Catalogs'
            },
            resolve: {
                Parameters: function($stateParams, ocParameters) {
                    return ocParameters.Get($stateParams);
                },
                CurrentAssignments: function($stateParams, ocCatalog) {
                    return ocCatalog.Assignments.Get(null, $stateParams.buyerid);
                },
                CatalogList: function(Parameters, CurrentAssignments, OrderCloudSDK) {
                    var catalogIDs = _.map(CurrentAssignments, 'CatalogID');
                    Parameters.filters.ID = catalogIDs.join('|');
                    Parameters.pageSize = 100;
                    return OrderCloudSDK.Catalogs.List(Parameters)
                        .then(function(data) {
                            angular.forEach(data.Items, function(catalog) {
                                var assignment = _.find(CurrentAssignments, {CatalogID: catalog.ID});
                                catalog.ViewAllProducts = assignment.ViewAllProducts;
                                catalog.ViewAllCategories = assignment.ViewAllCategories;
                            });
                            return data;
                        });
                },
                // CurrentAssignments1: function($stateParams, ocCatalog, OrderCloudSDK) {
                //     var options = {
                //         categoryID: $stateParams.categoryid,
                //         page: 1,
                //         pageSize: 100
                //     };
                //     return OrderCloudSDK.Categories.ListProductAssignments($stateParams.catalogid, options)
                //     // return ocCatalog.Products.GetAssignments($stateParams.categoryid, $stateParams.catalogid, $stateParams.usergroupid);
                // },
                // AssignedProducts: function($q, OrderCloudSDK, CurrentAssignments1){
                //     let IDs = _.map(CurrentAssignments1, 'ProductID');
                //     // id = ids.join('|')
                //     function callOCWithIdFilter(Ids, maxLength, func){
                //         var obj = {};
                //         var count = 0;
                //         var  apiCallQueue = [];
                //         obj[ 'Items' + count ] = '';

                //         _.each(Ids, function(id, index){
                //             //add to string
                //             //if too long undo and start new array
                //               if( ( ( id.length + 1 )  + obj[ 'Items' + count ].length ) > maxLength ){
                //                 count ++
                //                 obj[ 'Items' + count ] = '' + id + '|';                        
                //               }else{
                //                 obj[ 'Items' + count ] += id + '|';
                //               }
                //         });

                //         _.each(obj, (idList, k)=> {
                //             apiCallQueue.push(OrderCloudSDK.Products.List({ pageSize: 100, filters: {ID: idList}}));
                //         })
                //        return $q.all(apiCallQueue).then( results=>{
                //             var assignedProducts = [];
                //             _.each( results, (productList, k)=>{
                //                 assignedProducts = assignedProducts.concat( productList );
                //             });
                //             return assignedProducts;
                //         });


                //         // return obj;

                //     }
                //     return callOCWithIdFilter(IDs, 800);
                //     // return OrderCloudSDK.Products.List({filters: {ID: }})
                // },
            }
        });
}