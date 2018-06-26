angular.module('orderCloud')
    .factory('UGCatalogService', UGCatalogServiceController)
;

function UGCatalogServiceController($uibModal, $stateParams, OrderCloudSDK, ocCatalog, ocParameters){
    let service={
        AddProductModal: _addProductModal,
    }

    function _addProductModal(category, userGroup){
    
      
            return ocCatalog.Products.GetAssignments($stateParams.categoryid, $stateParams.catalogid, $stateParams.usergroupid).then(CurrentAssignments =>{
                return $uibModal.open({
                    templateUrl: 'catalogManagement/userGroupCatalog/templates/addProductAssignment.modal.html',
                    controller: 'UGCatalogProductAssignModal',
                    controllerAs: 'ugcProductAssignModal',
                    size: 'lg',
                    resolve: {         
                        ProductList: function( ) {
                            return OrderCloudSDK.Products.List($stateParams).then(function(data) {
                                return ocCatalog.Products.MapAssignments(CurrentAssignments, data);
                            })
                        },
                        Category: function(){
                            return category;
                        },
                        UserGroup: function(){
                            return userGroup;
                        }
                    }
                }).result;
            });
        
        
        
    }

    return service; 

}