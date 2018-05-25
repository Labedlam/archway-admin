angular.module('orderCloud')
    .factory('ocNavItems', OrderCloudNavItemsService)
;

function OrderCloudNavItemsService(ocRoles) {
    var service = {
        Product: _product,
        Catalog: _catalog,
        Buyer: _buyer,
        BuyerUserGroup: _buyerUserGroup,
        Order: _order,
        Filter: _filterNavItems
    };


    function _product() {
        return [{
                icon: 'fa-cube',
                state: 'product',
                name: 'Product',
                roles: {
                    Items: ['ProductRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-picture-o',
                state: 'product.images',
                name: 'Images',
                roles: {
                    Items: ['ProductRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-edit',
                state: 'product.specs',
                name: 'Specs',
                roles: {
                    Items: ['ProductRoles'],
                    Any:false
                }
            },
            {
                icon: 'fa-truck',
                state: 'product.shipping',
                name: 'Shipping',
                roles: {
                    Items: ['ProductRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-clipboard',
                state: 'product.inventory',
                name: 'Inventory',
                roles: {
                    Items: ['ProductRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-dollar',
                state: 'product.pricing',
                name: 'Pricing',
                roles: {
                    Items: ['PriceScheduleRoles', 'ProductAdmin', 'BuyerRoles', 'UserGroupRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-th-large',
                state: 'product.catalogs',
                name: 'Categories',
                activeWhen: ['product.catalogs', 'product.categories'],
                roles: {
                    Items: ['CatalogRoles', 'CategoryRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-cubes',
                state: 'product.relatedProducts',
                name: 'Related Products',
                roles: {
                    Items: ['ProductRoles'],
                    Any: false
                }
            }
        ];
    }

    function _catalog() {
        return [{
                icon: 'fa-sitemap',
                state: 'catalog',
                name: 'Catalog',
                roles: {
                    Items: ['CatalogRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-th-large',
                state: 'categories',
                name: 'Categories',
                activeWhen: ['categories', 'categories.category', 'categories.category.products'],
                roles: {
                    Items: ['CategoryRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-tags',
                state: 'catalog.buyers',
                name: 'Buyers',
                roles: {
                    //TODO: update this to ["BuyerRoles", "CatalogRoles"] after EX-1179 is complete
                    Items: ['BuyerRoles', 'CatalogAdmin'],
                    Any: false
                }
            },
            {
                icon: 'fa-th-large',
                state: 'chipGrids',
                name: 'Chip Grids',
                roles: {
                    Items: ['CategoryRoles'],
                    Any: false
                }
            }
        ];
    }

    function _buyer() {
        return [{
                icon: 'fa-cog',
                state: 'buyer',
                name: 'Settings',
                roles: {
                    Items: ['BuyerRoles', 'CatalogRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-lock',
                state: 'buyerPermissions',
                name: 'Permissions',
                roles: {
                    Items: ['SetSecurityProfile'],
                    Any: false
                }
            },
            {
                icon: 'fa-bell',
                state: 'buyerMessageSenders',
                name: 'Notifications',
                roles: {
                    Items: ['MessageConfigAssignmentAdmin'],
                    Any: false
                }
            },
            {
                icon: 'fa-dollar',
                state: 'buyerProducts',
                name: 'Pricing',
                roles: {
                    Items: ['PriceScheduleRoles', 'ProductAdmin'],
                    Any: false
                }
            },
            {
                icon: 'fa-th-large',
                state: 'buyerCatalogs',
                name: 'Categories',
                activeWhen: ['buyerCatalogs', 'buyerCatalog'],
                roles: {
                    Items: ['CatalogRoles', 'CategoryRoles', 'CatalogAdmin'],
                    Any: false
                }
            },
            {
                icon: 'fa-user',
                state: 'users',
                name: 'Users',
                roles: {
                    Items: ['BuyerUserRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-users',
                state: 'userGroups',
                name: 'Asset Collections',
                activeWhen: ['userGroups', 'userGroup*'],
                roles: {
                    Items: ['UserGroupRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-map-marker',
                state: 'addresses',
                name: 'Addresses',
                roles: {
                    Items: ['AddressRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-credit-card',
                state: 'creditCards',
                name: 'Credit Cards',
                roles: {
                    Items: ['CreditCardRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-money',
                state: 'spendingAccounts',
                name: 'Spending Accounts',
                roles: {
                    Items: ['SpendingAccountRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-asterisk',
                state: 'costCenters',
                name: 'Cost Centers',
                roles: {
                    Items: ['CostCenterRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-check-square-o',
                state: 'approvalRules',
                name: 'Approval Rules',
                roles: {
                    Items: ['ApprovalRuleRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-bullhorn',
                state: 'promotions',
                name: 'Promotions',
                roles: {
                    Items: ['PromotionRoles'],
                    Any: false
                }
            }
        ];
    }

    function _buyerUserGroup() {
        return [{
                icon: 'fa-cog',
                state: 'userGroup',
                name: 'Settings',
                roles: {
                    Items: ['UserGroupRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-lock',
                state: 'userGroup.permissions',
                name: 'Permissions',
                roles: {
                    Items: ['SetSecurityProfile'],
                    Any: false
                }
            },
            {
                icon: 'fa-bell',
                state: 'userGroup.messageSenders',
                name: 'Notifications',
                roles: {
                    Items: ['MessageConfigAssignmentAdmin'],
                    Any: false
                }
            },
            {
                icon: 'fa-dollar',
                state: 'userGroupProducts',
                name: 'Pricing',
                roles: {
                    Items: ['PriceScheduleRoles', 'ProductRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-th-large',
                state: 'userGroupCatalogs',
                name: 'Categories',
                activeWhen: ['userGroupCatalogs', 'userGroupCatalog'],
                roles: {
                    Items: ['CatalogRoles', 'CategoryRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-user',
                state: 'userGroup.users',
                name: 'Users',
                roles: {
                    Items: ['UserGroupRoles', 'BuyerUserRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-map-marker',
                state: 'userGroup.addresses',
                name: 'Addresses',
                roles: {
                    Items: ['AddressRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-credit-card',
                state: 'userGroup.creditCards',
                name: 'Credit Cards',
                roles: {
                    Items: ['CreditCardRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-money',
                state: 'userGroup.spendingAccounts',
                name: 'Spending Accounts',
                roles: {
                    Items: ['SpendingAccountRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-asterisk',
                state: 'userGroup.costCenters',
                name: 'Cost Centers',
                roles: {
                    Items: ['CostCenterRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-bullhorn',
                state: 'userGroup.promotions',
                name: 'Promotions',
                roles: {
                    Items: ['PromotionRoles'],
                    Any: false
                }
            }
        ];
    }

    function _order() {
        return [{
                icon: 'fa-file',
                state: 'orderDetail',
                name: 'Details',
                roles: {
                    Items: ['OrderRoles', 'BuyerRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-dollar',
                state: 'orderDetail.payments',
                name: 'Payments',
                roles: {
                    Items: ['OrderRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-truck',
                state: 'orderDetail.shipments',
                name: 'Shipments',
                activeWhen: ['orderDetail.shipments', 'orderDetail.shipments.create'],
                roles: {
                    Items: ['ShipmentRoles'],
                    Any: false
                }
            },
            {
                icon: 'fa-check-square-o',
                state: 'orderDetail.approvals',
                name: 'Approvals'
            }
        ];
    }

    function _filterNavItems(navItems) {
        return _.filter(navItems, function (navItem) {
            if (!navItem.roles) return true;
            return ocRoles.UserIsAuthorized(navItem.roles.Items, navItem.roles.any);
        });
    }


    return service;
}