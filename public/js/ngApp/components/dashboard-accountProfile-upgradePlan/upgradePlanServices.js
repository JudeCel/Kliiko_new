(function () {
    'use strict';
    angular.module('KliikoApp').factory('upgradePlanServices', upgradePlanServices);

    upgradePlanServices.$inject = ['$q','globalSettings', '$resource', 'dbg'];
    function upgradePlanServices($q,globalSettings, $resource, dbg) {

        var upgradePlanRestApi = {
            getAllCountries: $resource(globalSettings.restUrl+'/country-data', {}, {post: {method: 'POST'} }),
            getAllCurrencies: $resource(globalSettings.restUrl+'/country-data/currencies', {}, {post: {method: 'POST'} })
        };

        var cache = {};
        var upServices = {};

        upServices.getAllCountriesList = getAllCountriesList;
        upServices.getAllCurrenciesList = getAllCurrenciesList;




        return upServices;

        function getAllCountriesList() {
            var deferred = $q.defer();

            if (cache.allCountries) {
                deferred.resolve(cache.allCountries);
                dbg.log2('#upgradePlanServices > getAllCountriesList > return cached value');
                return deferred.promise;
            }

            dbg.log2('#upgradePlanServices > getAllCountriesList > make rest call');
            upgradePlanRestApi.getAllCountries.get({}, function(res) {
                dbg.log2('#upgradePlanServices > getAllCountriesList > rest call responds');
                deferred.resolve(res);
                cache.allCountries = res;
            });

            return deferred.promise;

        }

        function getAllCurrenciesList() {}
    }

})();


