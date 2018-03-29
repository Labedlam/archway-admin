angular.module('orderCloud')
    .filter('address', AddressFilter)
;

function AddressFilter() {
    return function(address, option) {
        if (!address) return null;
        if (option === 'full') {
            var result = [];

            //address name
            if (address.AddressName) result.push('<b>' + address.AddressName + '</b>');

            //address first/last
            if (address.FirstName || address.LastName) {
                result.push((address.FirstName && !address.LastName) ? address.FirstName : ((!address.FirstName && address.LastName) ? address.LastName : (address.FirstName + ' ' + address.LastName)));
            }

            //company name
            if (address.CompanyName) result.push(address.CompanyName);

            //street 1 (required)
            result.push(address.Street1);

            //street 1 (optional)
            if (address.Street2)  result.push(address.Street2);

            //city, state zip
            result.push(address.City + ', ' + address.State + ' ' + address.Zip);

            if (address.Phone) result.push(address.Phone);

            return result.join('<br/>');
        }
        else if (option == 'fullOneLine') {
            return address.Street1 + (address.Street2 ? ', ' + address.Street2 : '') + ' ' + address.City + ', ' + address.State + ' ' + address.Zip;
        }
        else {
            return address.Street1 + (address.Street2 ? ', ' + address.Street2 : '');
        }
    };
}