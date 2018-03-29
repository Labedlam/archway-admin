angular.module('orderCloud')
    .factory('ocCostCenters', OrderCloudCostCenters)
;

function OrderCloudCostCenters($q, $uibModal, ocConfirm, OrderCloudSDK) {
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
            templateUrl: 'buyerManagement/costCenters/templates/costCenterCreate.modal.html',
            controller: 'CostCenterCreateModalCtrl',
            controllerAs: 'costCenterCreateModal',
            resolve: {
                SelectedBuyerID: function() {
                    return buyerid;
                }
            }
        }).result;
    }

    function _edit(costCenter, buyerid) {
        return $uibModal.open({
            templateUrl: 'buyerManagement/costCenters/templates/costCenterEdit.modal.html',
            controller: 'CostCenterEditModalCtrl',
            controllerAs: 'costCenterEditModal',
            bindToController: true,
            resolve: {
                SelectedCostCenter: function() {
                    return costCenter;
                },
                SelectedBuyerID: function() {
                    return buyerid;
                }
            }
        }).result;
    }

    function _delete(costCenter, buyerid) {
        return ocConfirm.Confirm({
                message:'Are you sure you want to delete <br> <b>' + costCenter.Name + '</b>?',
                confirmText: 'Delete cost center',
                type: 'delete'})
            .then(function() {
                return OrderCloudSDK.CostCenters.Delete(buyerid, costCenter.ID);
            });
    }

    function _getAssignments(level, buyerid, usergroupid) {
        var options = {
            userGroupID: usergroupid,
            level: level,
            pageSize: 100
        };
        return OrderCloudSDK.CostCenters.ListAssignments(buyerid, options)
            .then(function(data1) {
                var df = $q.defer(),
                    queue = [],
                    totalPages = angular.copy(data1.Meta.TotalPages),
                    currentPage = angular.copy(data1.Meta.Page);
                while(currentPage < totalPages) {
                    currentPage++;
                    options.page = currentPage;
                    queue.push(OrderCloudSDK.CostCenters.ListAssignments(buyerid, options));
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

    function _mapAssignments(allAssignments, costCenterList) {
        costCenterList.Items = _.map(costCenterList.Items, function(costCenter) {
            costCenter.Assigned = false;
            angular.forEach(allAssignments, function(assignment) {
                if (costCenter.ID == assignment.CostCenterID) costCenter.Assigned = true;
            });
            return costCenter;
        });

        return costCenterList;
    }

    function _compareAssignments(allAssignments, costCenterList, userGroupID) {
        var changedAssignments = [];
        angular.forEach(costCenterList.Items, function(costCenter) {
            var existingAssignment = _.filter(allAssignments, {CostCenterID:costCenter.ID})[0];
            if (existingAssignment && !costCenter.Assigned) {
                changedAssignments.push({
                    'old': existingAssignment,
                    'new': null
                });
            } else if (!existingAssignment && costCenter.Assigned) {
                changedAssignments.push({
                    'old': null,
                    'new': {
                        UserGroupID: userGroupID,
                        CostCenterID: costCenter.ID
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

                    OrderCloudSDK.CostCenters.SaveAssignment(buyerid, diff.new) // -- Create new User Assignment
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
                    OrderCloudSDK.CostCenters.DeleteAssignment(buyerid, diff.old.CostCenterID, options)
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