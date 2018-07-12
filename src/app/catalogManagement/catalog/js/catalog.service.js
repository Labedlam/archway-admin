angular.module('orderCloud')
    .factory('ocCatalog', OrderCloudCatalog)
;

function OrderCloudCatalog($q, $uibModal, OrderCloudSDK, ocConfirm) {
    var service = {
        CreateCategory: _createCategory,
        EditCategory: _editCategory,
        DeleteCategory: _deleteCategory,
        Products: {
            GetAssignments: _getProductAssignments,
            GetCategoryProducts: _getCategoryProducts,
            MapAssignments: _mapProductAssignments,
            CompareAssignments: _compareProductAssignments,
            UpdateAssignments: _updateProductAssignments
        },
        Availability: {
            GetAssignments: _getAvailabilityAssignments,
            MapAssignments: _mapAvailabilityAssignments,
            CompareAssignments: _compareAvailabilityAssignments,
            UpdateAssignments: _updateAvailabilityAssignments,
            ToggleAssignment: _toggleAvailabilityAssignments
        },
        Assignments: {
            Get: _getAssignments,
            Map: _mapAssignments,
            Compare: _compareAssignments,
            Update: _updateAssignments,
            UpdateAssignment: _updateAssignment
        }
    };

    function _createCategory(parentid, catalogid) {
        return $uibModal.open({
            templateUrl: 'catalogManagement/catalog/templates/catalogCategoryCreate.modal.html',
            controller: 'CreateCategoryModalCtrl',
            controllerAs: 'createCategory',
            size: 'md',
            resolve: {
                ParentID: function() {
                    return parentid;
                },
                CatalogID: function() {
                    return catalogid;
                }
            }
        }).result;
    }

    function _editCategory(category, catalogid) {
        return $uibModal.open({
            templateUrl: 'catalogManagement/catalog/templates/catalogCategoryEdit.modal.html',
            controller: 'EditCategoryModalCtrl',
            controllerAs: 'editCategory',
            size: 'md',
            resolve: {
                SelectedCategory: function() {
                    return category;
                },
                CatalogID: function() {
                    return catalogid;
                },
                IsChipSection: function() {
                    if (!category.ParentID) return;
                    return OrderCloudSDK.Categories.Get(catalogid, category.ParentID).then( parentCategory => {
                        return parentCategory.xp && parentCategory.xp.IsChipGrid;
                    });
                }
            }
        }).result;
    }

    function _deleteCategory(category, catalogid) {
        return ocConfirm.Confirm({
                message:'Are you sure you want to delete <br> <b>' + category.Name + '</b>?',
                confirmText: 'Delete category',
                type: 'delete'})
            .then(function() {
                return OrderCloudSDK.Categories.Delete(catalogid, category.ID);
            });
    }

    function _getProductAssignments(categoryid, catalogid, usergroupid) {
        var deferred = $q.defer();
        var assignments = [];

        var options = {
            categoryID: categoryid,
            page: 1,
            pageSize: 100
        };
        if(usergroupid){
            options.userGroupID = usergroupid;
            OrderCloudSDK.Products.ListAssignments(options)
            .then(function(data) {
                assignments = data.Items;
                var page = data.Meta.Page;
                var queue = [];
                while (page <= data.Meta.TotalPages) {
                    page++;
                    options.page = page;
                    queue.push( OrderCloudSDK.Products.ListAssignments(options));
                }
                $q.all(queue).then(function(results) {
                    angular.forEach(results, function(result) {
                        assignments = assignments.concat(result.Items);
                    });
                    deferred.resolve(assignments);
                });
            });
        }else{
            OrderCloudSDK.Categories.ListProductAssignments(catalogid, options)
            .then(function(data) {
                assignments = data.Items;
                var page = data.Meta.Page;
                var queue = [];
                while (page <= data.Meta.TotalPages) {
                    page++;
                    options.page = page;
                    queue.push(OrderCloudSDK.Categories.ListProductAssignments(catalogid, options));
                }
                $q.all(queue).then(function(results) {
                    angular.forEach(results, function(result) {
                        assignments = assignments.concat(result.Items);
                    });
                    deferred.resolve(assignments);
                });
            });
        }
      

        return deferred.promise;
    }
    //filters  productAssignment by category. grab category products. compare and return an array of assignmentlist back with product info
    function _getCategoryProducts( UGProductassignments, catalogid, categoryid ){
        var queue=[];
       
        var assignments = [];

        var options = {
            categoryID: categoryid,
            page: 1,
            pageSize: 100
        };
        var categoryAssignments = [];

        return  OrderCloudSDK.Categories.ListProductAssignments(catalogid, options).then(function(data) {
            assignments = data.Items;
            var page = data.Meta.Page;
            var queue = [];
            while (page <= data.Meta.TotalPages) {
                page++;
                options.page = page;
                queue.push(OrderCloudSDK.Categories.ListProductAssignments(catalogid, options));
            }
            return $q.all(queue).then(function(results) {
                angular.forEach(results, function(result) {
                    assignments = assignments.concat(result.Items);
                });

                 _.each( UGProductassignments, (ugAssignment) =>{
                    var match =  _.find( assignments, (assignment) => assignment.ProductID === ugAssignment.ProductID );
                    if (match) categoryAssignments.push(match);
                } ); 

                _.each( categoryAssignments, (assignment )=> {
                    queue.push( function(){
                        return OrderCloudSDK.Products.Get(assignment.ProductID)
                            .then((product)=>{
                                return assignment.Product = product;
                            });
                    }());
                });

                 return $q.all(queue).then(()=> {return {Items: categoryAssignments };} );
                });
            });
    }


    function _mapProductAssignments(allAssignments, productList) {
        productList.Items = _.map(productList.Items, function(product) {
            product.Assigned = false;
            angular.forEach(allAssignments, function(assignment) {
                if (product.ID == assignment.ProductID) product.Assigned = true;
            });
            return product;
        });
        return productList;
    }

    function _compareProductAssignments(allAssignments, productList, categoryID, usergroupid) {
        var changedAssignments = [];
        angular.forEach(productList.Items, function(product) {
            var existingAssignment = _.filter(allAssignments, {ProductID: product.ID})[0];
            if (existingAssignment && !product.Assigned) {
                changedAssignments.push({
                    'old': existingAssignment,
                    'new': null
                });
            } else if (!existingAssignment && product.Assigned) {
                changedAssignments.push({
                    'old': null,
                    'new': {
                        ProductID: product.ID,
                        CategoryID: categoryID
                    }
                });
            }
        });

        return changedAssignments;
    }

    function _updateProductAssignments(allAssignments, changedAssignments, catalogid, buyerID, userGroupID) {
        var deferred = $q.defer();
        var assignmentQueue = [];
        var errors = [];

        angular.forEach(changedAssignments, function(diff) {
            if (!diff.old && diff.new) {
                assignmentQueue.push((function() {
                    var categoryAssignment = {CategoryID: diff.new.CategoryID, ProductID: diff.new.ProductID };
                    OrderCloudSDK.Categories.SaveProductAssignment(catalogid, categoryAssignment)
                        .then(()=>{
                            //create new category assignment
                            allAssignments.push(diff.new); //add the new assignment to the assignment list
                        });
                })());
            } else if (diff.old && !diff.new) {
                assignmentQueue.push((function() {
                    OrderCloudSDK.Categories.DeleteProductAssignment(catalogid, diff.old.CategoryID, diff.old.ProductID)
                        .then(function() {
                            allAssignments.splice(allAssignments.indexOf(diff.old), 1); //remove the old assignment from the assignment list
                        })
                        .catch(function(ex) {
                            errors.push(ex);
                        });
                })());
            }
        });

        $q.all(assignmentQueue).then(function() {
            deferred.resolve({UpdatedAssignments: allAssignments, Error: errors});
        });

        return deferred.promise;
    }



    function _getAvailabilityAssignments(categoryid, buyerid, catalogid) {
        var deferred = $q.defer();
        var resolve = {
            Type: 'none',
            Meta: {},
            Items: []
        };

        //categoryID, userID, userGroupID, level, page, pageSize, buyerID, catalogID
        var options = {
            categoryID: categoryid,
            level: 'Company',
            buyerID: buyerid
        };
        OrderCloudSDK.Categories.ListAssignments(catalogid, options)
            .then(function(buyerAssignment) {
                if (buyerAssignment.Meta.TotalCount) {
                    resolve.Type = 'buyer';
                    resolve.Meta = buyerAssignment.Meta;
                    resolve.Items = buyerAssignment.Items;
                    deferred.resolve(resolve);
                }
                else {
                    getUserGroupAssignments();
                }
            });

        function getUserGroupAssignments() {
            var options = {
                categoryID: categoryid,
                page: 1,
                pageSize: 100,
                buyerID: buyerid
            };
            OrderCloudSDK.Categories.ListAssignments(catalogid, options)
                .then(function(assignmentList){
                    //get list of userGroupIDs. Remove any null values (from buyerID assignments);
                    var userGroupIDs =  _.compact(_.map(assignmentList.Items, 'UserGroupID'));
                    resolve.Meta = assignmentList.Meta;
                    resolve.Items = assignmentList.Items;
                    if(!userGroupIDs.length) {
                        deferred.resolve(resolve);
                    }
                    else {
                        resolve.Type = 'userGroups';
                        var page = assignmentList.Meta.Page;
                        var queue = [];
                        while (page <= assignmentList.Meta.TotalPages) {
                            page++;
                            options.page = page;
                            queue.push(OrderCloudSDK.Categories.ListAssignments(catalogid, options));
                        }
                        $q.all(queue).then(function(results) {
                            angular.forEach(results, function(result) {
                                resolve.Items = resolve.Items.concat(result.Items);
                            });
                            deferred.resolve(resolve);
                        });
                    }
                });
        }

        return deferred.promise;
    }

    function _mapAvailabilityAssignments(allAssignments, userGroupList) {
        userGroupList.Items = _.map(userGroupList.Items, function(userGroup) {
            userGroup.Assigned = false;
            angular.forEach(allAssignments, function(assignment) {
                if (userGroup.ID == assignment.UserGroupID) userGroup.Assigned = true;
            });
            return userGroup;
        });
        return userGroupList;
    }

    function _compareAvailabilityAssignments(allAssignments, userGroupList, categoryID, buyerID) {
        var changedAssignments = [];
        angular.forEach(userGroupList.Items, function(userGroup) {
            var existingAssignment = _.filter(allAssignments, {UserGroupID: userGroup.ID})[0];
            if (existingAssignment && !userGroup.Assigned) {
                changedAssignments.push({
                    'old': existingAssignment,
                    'new': null
                });
            } else if (!existingAssignment && userGroup.Assigned) {
                changedAssignments.push({
                    'old': null,
                    'new': {
                        BuyerID: buyerID,
                        UserGroupID: userGroup.ID,
                        CategoryID: categoryID
                    }
                });
            }
        });

        return changedAssignments;
    }

    function _updateAvailabilityAssignments(allAssignments, changedAssignments, categoryid, catalogid, buyerid) {
        var deferred = $q.defer();

        var assignmentQueue = [];
        var errors = [];

        if (_.filter(allAssignments, function(assignment) { return assignment.BuyerID && !assignment.UserGroupID; }).length) {
            //remove assignment at buyer level
            changedAssignments.push({
                old: {
                    BuyerID: buyerid,
                    CategoryID: categoryid
                }
            });
        }

        angular.forEach(changedAssignments, function(diff) {
            if (!diff.old && diff.new) {
                assignmentQueue.push((function() {
                    var d = $q.defer();

                    OrderCloudSDK.Categories.SaveAssignment(catalogid, diff.new) //create new category assignment
                        .then(function() {
                            allAssignments.push(diff.new); //add the new assignment to the assignment list
                            d.resolve();
                        })
                        .catch(function(ex) {
                            errors.push(ex);
                            d.resolve();
                        });

                    return d.promise;
                })());
            }
            else if (diff.old && !diff.new) {
                assignmentQueue.push((function() {
                    var d = $q.defer();

                    OrderCloudSDK.Categories.DeleteAssignment(catalogid, diff.old.CategoryID, buyerid, {userGroupID: diff.old.UserGroupID})
                        .then(function() {
                            allAssignments.splice(allAssignments.indexOf(diff.old), 1); //remove the old assignment from the assignment list
                            d.resolve();
                        })
                        .catch(function(ex) {
                            errors.push(ex);
                            d.resolve();
                        });

                    return d.promise;
                })());
            }
        });

        $q.all(assignmentQueue).then(function() {
            deferred.resolve({UpdatedAssignments: allAssignments, Error: errors});
        });

        return deferred.promise;
    }

    function _toggleAvailabilityAssignments(assignmentType, category, buyer, currentAssignments, catalogID) {
        var deferred = $q.defer();

        if (assignmentType == 'buyer') {
            var assignment = {
                CategoryID: category.ID,
                BuyerID: buyer.ID,
                UserID: null,
                UserGroupID: null
            };
            OrderCloudSDK.Categories.SaveAssignment(catalogID, assignment)
                .then(function() {
                    deferred.resolve();
                });
        }
        else if (assignmentType == 'none') {
            var queue = [];
            angular.forEach(currentAssignments.Items, function(assignment) {
                queue.push(OrderCloudSDK.Categories.DeleteAssignment(catalogID, category.ID, buyer.ID, {userGroupID: assignment.UserGroupID})) ;
            });
            $q.all(queue).then(function() {
                deferred.resolve(queue.length);
            });
        }
        else {
            deferred.resolve();
        }

        return deferred.promise;
    }

    function _getAssignments(catalogid, buyerid) {
        var options = {
            catalogID: catalogid,
            buyerID: buyerid,
            pageSize: 100
        };
        return OrderCloudSDK.Catalogs.ListAssignments(options)
            .then(function(data) {
                var df = $q.defer(),
                    queue = [],
                    totalPages = angular.copy(data.Meta.TotalPages),
                    currentPage = angular.copy(data.Meta.Page);
                while(currentPage < totalPages) {
                    currentPage++;
                    options.page = currentPage;
                    queue.push(OrderCloudSDK.Catalogs.ListAssignments(options));
                }
                $q.all(queue)
                    .then(function(results) {
                        angular.forEach(results, function(r) {
                            data.Items = data.Items.concat(r.Items);
                        });
                        df.resolve(data.Items);
                    });
                return df.promise;
            });
    }

    function _mapAssignments(allAssignments, buyerList) {
        buyerList.Items = _.map(buyerList.Items, function(buyer) {
            buyer.Assigned = false;
            angular.forEach(allAssignments, function(assignment) {
                if (buyer.ID == assignment.BuyerID) {
                    buyer.Assigned = true;
                    buyer.ViewAllProducts = assignment.ViewAllProducts;
                    buyer.ViewAllCategories = assignment.ViewAllCategories;
                }
            });
            return buyer;
        });

        return buyerList;
    }

    function _compareAssignments(allAssignments, buyerList, catalogID) {
        var changedAssignments = [];
        angular.forEach(buyerList.Items, function(buyer) {
            var existingAssignment = _.filter(allAssignments, {BuyerID:buyer.ID})[0];
            if (existingAssignment && !buyer.Assigned) {
                changedAssignments.push({
                    'old': existingAssignment,
                    'new': null
                });
            } else if (!existingAssignment && buyer.Assigned) {
                changedAssignments.push({
                    'old': null,
                    'new': {
                        BuyerID: buyer.ID,
                        CatalogID: catalogID
                    }
                });
            }
        });

        return changedAssignments;
    }

    function _updateAssignments(allAssignments, changedAssignments, catalogID) {
        var df = $q.defer(),
            assignmentQueue = [],
            errors = [];

        angular.forEach(changedAssignments, function(diff) {
            if (!diff.old && diff.new) {
                assignmentQueue.push((function() {
                    var d = $q.defer();

                    OrderCloudSDK.Catalogs.SaveAssignment(diff.new) // -- Create new User Assignment
                        .then(function() {
                            allAssignments.push(diff.new); //add the new assignment to the assignment list
                            d.resolve();
                        })
                        .catch(function(ex) {
                            errors.push(ex);
                            d.resolve();
                        });

                    return d.promise;
                })());
            } else if (diff.old && !diff.new) { // -- Delete existing User Assignment
                assignmentQueue.push((function() {
                    var d = $q.defer();

                    var options = {
                        userGroupID: diff.old.UserGroupID
                    };
                    OrderCloudSDK.Catalogs.DeleteAssignment(catalogID, diff.old.BuyerID)
                        .then(function() {
                            allAssignments.splice(allAssignments.indexOf(diff.old), 1); //remove the old assignment from the assignment list
                            d.resolve();
                        })
                        .catch(function(ex) {
                            errors.push(ex);
                            d.resolve();
                        });

                    return d.promise;
                })());
            }
        });

        $q.all(assignmentQueue)
            .then(function() {
                df.resolve({
                    UpdatedAssignments: allAssignments,
                    Errors: errors
                });
            });


        return df.promise;
    }

    function _updateAssignment(catalogID, buyerID, options) {
        var df = $q.defer();

        var assignment = {
            catalogID: catalogID,
            buyerID: buyerID,
            viewAllCategories: options.ViewAllCategories,
            viewAllProducts: options.ViewAllProducts
        };

        OrderCloudSDK.Catalogs.SaveAssignment(assignment)
            .then(function() {
                df.resolve(assignment);
            });

        return df.promise;
    }

    return service;
}