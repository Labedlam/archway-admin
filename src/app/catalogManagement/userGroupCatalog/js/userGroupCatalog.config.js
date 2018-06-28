angular.module('orderCloud')
    .config(UserGroupCatalogConfig)
;

function UserGroupCatalogConfig($stateProvider) {
    $stateProvider
        .state('userGroupCatalog', {
            parent: 'userGroup',
            url: '/catalog/:catalogid',
            templateUrl: 'catalogManagement/userGroupCatalog/templates/userGroupCatalog.html',
            controller: 'UserGroupCatalogCtrl',
            controllerAs: 'userGroupCatalog',
            data: {
                pageTitle: 'User Group Catalog'
            },
            resolve: {
                SelectedCatalog: function($stateParams, OrderCloudSDK) {
                    return OrderCloudSDK.Catalogs.Get($stateParams.catalogid);
                },
                CatalogAssignment: function($stateParams, OrderCloudSDK) {
                    var options = {
                        catalogID: $stateParams.catalogid,
                        userGroupID: $stateParams.userGroupid
                    };
                    return OrderCloudSDK.Catalogs.ListAssignments(options)
                        .then(function(data) {
                            return data.Items[0];
                        });
                },
                BuyerCategoryAssignments: function($stateParams, ocCatalogCategories) {
                    return ocCatalogCategories.Assignments.Get($stateParams.catalogid, $stateParams.buyerid);
                },
                UserGroupCategoryAssignments: function($stateParams, ocCatalogCategories) {
                    return ocCatalogCategories.Assignments.Get($stateParams.catalogid, $stateParams.buyerid, $stateParams.usergroupid);
                },
                CategoryList: function($stateParams, ocCatalogCategories) {
                    let parameters = {
                        catalogID: $stateParams.catalogid
                    };
                    return ocCatalogCategories.GetAll(parameters);
                },
                Tree: function(CategoryList, ocCatalogTree, ocCatalogCategories, CatalogAssignment, BuyerCategoryAssignments, UserGroupCategoryAssignments) {
                    var buyerMappedData = ocCatalogCategories.Assignments.Map(CategoryList, CatalogAssignment.ViewAllCategories ? true : BuyerCategoryAssignments, true);
                    var userGroupMappedData = CatalogAssignment.ViewAllCategories ? {} : ocCatalogCategories.Assignments.Map(CategoryList, UserGroupCategoryAssignments);
                    var assignedBuyerCategoryIDs = _.map(buyerMappedData, 'ID');

                    angular.forEach(userGroupMappedData, function(category) {
                        var index = _.findIndex(buyerMappedData, function(cat) {
                            return cat.ID == category.ID;
                        });
                        if (!buyerMappedData[index].Assigned) buyerMappedData[index] = category;
                    });

                    return ocCatalogTree.Get(buyerMappedData);
                }
            }
        })
        .state('productAssignment', {
            parent: 'userGroup',
            url: '/:catalogid/:categoryid?search&page&pageSize&searchOn&sortBy&filters',
            templateUrl: 'catalogManagement/userGroupCatalog/templates/userGroupProductAssignment.html',
            controller: 'UserGroupProductAssignmentCtrl',
            controllerAs: 'ugProductAssignment',
            resolve:{
                Parameters: function($stateParams, ocParameters) {
                    return ocParameters.Get($stateParams);
                },
                Category: function($stateParams, OrderCloudSDK){
                    return OrderCloudSDK.Categories.Get($stateParams.catalogid, $stateParams.categoryid);
                },
                UserGroup: function($stateParams, OrderCloudSDK){
                    return OrderCloudSDK.UserGroups.Get($stateParams.buyerid, $stateParams.usergroupid)
                },               
                CurrentAssignments: function($stateParams, ocCatalog) {
                    //get ALL products ids assigned to UG id.
                    return ocCatalog.Products.GetAssignments($stateParams.categoryid, $stateParams.catalogid, $stateParams.usergroupid);
                },
                ProductList: function(OrderCloudSDK, ocCatalog, Parameters, CurrentAssignments) {
                    //service will grab all products assigned to this category id, then match Ids against all assignments on a UG , then bring back products assigned to the ug and catalog. 
                   return  ocCatalog.Products.GetCategoryProducts(CurrentAssignments, Parameters.catalogid, Parameters.categoryid);
                }
            }
        })
        .state('productAssignmentUpdate', {
            parent: 'userGroup',
            url: '/:catalogid/:categoryid/addAssignment?search&page&pageSize&searchOn&sortBy&filters',
            templateUrl: 'catalogManagement/userGroupCatalog/templates/addProductAssignment.html',
            controller: 'UGCatalogAddProductAssignCtrl',
            controllerAs: 'ugAddProductAssignment',
            resolve:{
                Parameters: function($stateParams, ocParameters) {
                    return ocParameters.Get($stateParams);
                },
                Category: function($stateParams, OrderCloudSDK){
                    return OrderCloudSDK.Categories.Get($stateParams.catalogid, $stateParams.categoryid);
                },
                UserGroup: function($stateParams, OrderCloudSDK){
                    return OrderCloudSDK.UserGroups.Get($stateParams.buyerid, $stateParams.usergroupid)
                },               
                CurrentAssignments: function($stateParams, ocCatalog, Parameters) {
                    return ocCatalog.Products.GetAssignments($stateParams.categoryid, $stateParams.catalogid, $stateParams.usergroupid)
                        .then(allUGProducts =>{
                            return  ocCatalog.Products.GetCategoryProducts(allUGProducts, Parameters.catalogid, Parameters.categoryid)
                        })
                },
                ProductList: function(OrderCloudSDK, ocCatalog, Parameters, CurrentAssignments) {
                    return OrderCloudSDK.Products.List(Parameters)
                        .then(function(data) {
                            return ocCatalog.Products.MapAssignments(CurrentAssignments.Items, data);
                        });
                }
            }
        })
}