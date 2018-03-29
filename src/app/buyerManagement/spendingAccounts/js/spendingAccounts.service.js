angular.module('orderCloud')
    .factory('ocSpendingAccounts', OrderCloudSpendingAccounts)
;

function OrderCloudSpendingAccounts($q, $uibModal, ocConfirm, OrderCloudSDK) {
    var service = {
        Create: _create,
        Edit: _edit,
        Delete: _delete,
        Assignments: {
            Get: _getAssignments,
            Map: _mapAssignments,
            Compare: _compareAssignments,
            Update: _updateAssignments
        }
    };

    function _create(buyerid) {
        return $uibModal.open({
            templateUrl: 'buyerManagement/spendingAccounts/templates/spendingAccountCreate.modal.html',
            controller: 'SpendingAccountCreateModalCtrl',
            controllerAs: 'spendingAccountCreateModal',
            resolve: {
                SelectedBuyerID: function() {
                    return buyerid;
                }
            }
        }).result;
    }

    function _edit(spendingAccount, buyerid) {
        return $uibModal.open({
            templateUrl: 'buyerManagement/spendingAccounts/templates/spendingAccountEdit.modal.html',
            controller: 'SpendingAccountEditModalCtrl',
            controllerAs: 'spendingAccountEditModal',
            bindToController: true,
            resolve: {
                SelectedSpendingAccount: function() {
                    return spendingAccount;
                },
                SelectedBuyerID: function() {
                    return buyerid;
                }
            }
        }).result;
    }

    function _delete(spendingAccount, buyerid) {
        return ocConfirm.Confirm({
                message:'Are you sure you want to delete <br> <b>' + spendingAccount.Name + '</b>?',
                confirmText: 'Delete spending account',
                type: 'delete'})
            .then(function() {
                return OrderCloudSDK.SpendingAccounts.Delete(buyerid, spendingAccount.ID);
            });
    }

    function _getAssignments(level, buyerid, usergroupid) {
        var options = {
            userGroupID: usergroupid,
            level:level,
            pageSize:100
        };
        return OrderCloudSDK.SpendingAccounts.ListAssignments(buyerid, options)
            .then(function(data1) {
                var df = $q.defer(),
                    queue = [],
                    totalPages = angular.copy(data1.Meta.TotalPages),
                    currentPage = angular.copy(data1.Meta.Page);
                while(currentPage < totalPages) {
                    currentPage++;
                    options.page = currentPage;
                    queue.push(OrderCloudSDK.SpendingAccounts.ListAssignments(buyerid, options));
                }
                $q.all(queue)
                    .then(function(results) {
                        angular.forEach(results, function(r) {
                            data1.Items = data1.Items.concat(r.Items);
                        });
                        df.resolve(data1.Items);
                    });
                return df.promise;
            });
    }

    function _mapAssignments(allAssignments, spendingAccountList) {
        spendingAccountList.Items = _.map(spendingAccountList.Items, function(spendingAccount) {
            spendingAccount.Assigned = false;
            angular.forEach(allAssignments, function(assignment) {
                if (spendingAccount.ID == assignment.SpendingAccountID) spendingAccount.Assigned = true;
            });
            return spendingAccount;
        });

        return spendingAccountList;
    }

    function _compareAssignments(allAssignments, spendingAccountList, userGroupID) {
        var changedAssignments = [];
        angular.forEach(spendingAccountList.Items, function(spendingAccount) {
            var existingAssignment = _.filter(allAssignments, {SpendingAccountID:spendingAccount.ID})[0];
            if (existingAssignment && !spendingAccount.Assigned) {
                changedAssignments.push({
                    'old': existingAssignment,
                    'new': null
                });
            } else if (!existingAssignment && spendingAccount.Assigned) {
                changedAssignments.push({
                    'old': null,
                    'new': {
                        UserGroupID: userGroupID,
                        SpendingAccountID: spendingAccount.ID
                    }
                });
            }
        });

        return changedAssignments;
    }

    function _updateAssignments(allAssignments, changedAssignments, buyerid) {
        var df = $q.defer(),
            assignmentQueue = [],
            errors = [];

        angular.forEach(changedAssignments, function(diff) {
            if (!diff.old && diff.new) {
                assignmentQueue.push((function() {
                    var d = $q.defer();

                    OrderCloudSDK.SpendingAccounts.SaveAssignment(buyerid, diff.new) // -- Create new User Assignment
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

                    OrderCloudSDK.SpendingAccounts.DeleteAssignment(buyerid, diff.old.SpendingAccountID, {userGroupID: diff.old.UserGroupID})
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

    return service;
}