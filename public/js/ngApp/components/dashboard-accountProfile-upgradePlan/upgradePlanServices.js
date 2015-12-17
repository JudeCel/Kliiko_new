(function () {
    'use strict';
    angular.module('KliikoApp').factory('upgradePlanServices', upgradePlanServices);

    upgradePlanServices.$inject = ['$q','globalSettings', '$resource', 'dbg'];
    function upgradePlanServices($q,globalSettings, $resource, dbg) {

        var upgradePlanRestApi = {
            getAllCountries: $resource(globalSettings.restUrl+'/countries', {}, {post: {method: 'POST'} }),
            getAllCurrencies: $resource(globalSettings.restUrl+'/currencies', {}, {post: {method: 'POST'} }),
            getPlans: $resource(globalSettings.restUrl+'/plans', {}, {post: {method: 'POST'} })
        };

        var cache = {};
        var upServices = {};

        upServices.getAllCountriesList = getAllCountriesList;
        upServices.getAllCurrenciesList = getAllCurrenciesList;
        upServices.getPlans = getPlans;

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

        function getAllCurrenciesList() {
            var deferred = $q.defer();

            if (cache.allCurrencies) {
                deferred.resolve(cache.allCurrencies);
                dbg.log2('#upgradePlanServices > getAllCurrenciesList > return cached value');
                return deferred.promise;
            }

            dbg.log2('#upgradePlanServices > getAllCurrenciesList > make rest call');
            upgradePlanRestApi.getAllCurrencies.get({}, function(res) {
                dbg.log2('#upgradePlanServices > getAllCurrenciesList > rest call responds');
                deferred.resolve(res);
                cache.allCurrencies = res;
            });

            return deferred.promise;

        }

        function getPlans() {
            var deferred = $q.defer();

            if (cache.allCurrencies) {
                deferred.resolve(cache.getPlans);
                dbg.log2('#upgradePlanServices > getPlans > return cached value');
                return deferred.promise;
            }

            dbg.log2('#upgradePlanServices > getPlans > make rest call');
            upgradePlanRestApi.getPlans.get({}, function(res) {
                dbg.log2('#upgradePlanServices > getPlans > rest call responds');
                deferred.resolve(res);
                cache.getPlans = res;
            });

            return deferred.promise;

        }
    }

})();


