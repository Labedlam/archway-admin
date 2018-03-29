angular.module('orderCloud')
	.factory('ocParameters', OrderCloudParametersService)
;

function OrderCloudParametersService($filter) {
	var service = {
		Get: _get, //get params for use in OrderCloud service
		Create: _create //create params obj ready for use in OrderCloud $state.go()
	};

	function _get(stateParams, suffix) {
		var parameters = angular.copy(stateParams);
		var suffixParams;
		if (parameters.filters) {
			parameters.filters = JSON.parse(parameters.filters);
		} else {
			parameters.filters = {};
		}
		parameters.from ? parameters.from = new Date(parameters.from) : angular.noop(); //Translate date string to date obj
		parameters.to ? parameters.to = new Date(parameters.to) : angular.noop(); //Translate date string to date obj
		if (suffix) {
			suffixParams = {};
			angular.forEach(parameters, function(val, key) {
				suffixParams[key.split(suffix)[0]] = val;
			});
		}
		return suffixParams || parameters;
	}

	function _create(params, resetPage, suffix) {
		var parameters = angular.copy(params);
		var suffixParams;
		resetPage ? parameters.page = null : angular.noop(); //Reset page when filters are applied
		if (parameters.filters) {
			parameters.filters.orderType == '' ? delete parameters.filters.orderType : angular.noop();
			parameters.filters.type == '' ? delete parameters.filters.type : angular.noop();
			(parameters.filters.status == null || parameters.filters.status == '') ? delete parameters.filters.status : angular.noop();
			parameters.filters = JSON.stringify(parameters.filters); //Translate filter object to string
			parameters.filters == '{}' ? parameters.filters = null : angular.noop(); //Null out the filter string if it's an empty obj
		}
		if (parameters.fromDate) parameters.fromDate = $filter('date')(parameters.fromDate, 'MM-dd-yyyy');
		if (parameters.toDate) parameters.toDate = $filter('date')(parameters.toDate, 'MM-dd-yyyy');
		if (suffix) {
			suffixParams = {};
			angular.forEach(parameters, function(val, key) {
				suffixParams[key + suffix] = val;
			});
		}
		return suffixParams || parameters;
	}

	return service;
}