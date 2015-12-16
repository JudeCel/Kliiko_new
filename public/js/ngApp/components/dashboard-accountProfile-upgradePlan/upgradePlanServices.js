(function () {
    'use strict';
    angular.module('KliikoApp').factory('upgradePlanServices', upgradePlanServices);

    upgradePlanServices.$inject = ['$q','globalSettings', '$resource', 'dbg'];
    function upgradePlanServices($q,globalSettings, $resource, dbg) {

        var upgradePlanRestApi = {
            getAllCountries: $resource(globalSettings.restUrl+'/country-and-currency-data/countries', {}, {post: {method: 'POST'} }),
            getAllCurrencies: $resource(globalSettings.restUrl+'/country-and-currency-data/currencies', {}, {post: {method: 'POST'} }),
            getPlans: $resource(globalSettings.restUrl+'/plans', {}, {post: {method: 'POST'} }),
            upgrade: $resource(globalSettings.restUrl+'/upgrade', {}, {post: {method: 'POST'} })
        };

        var cache = {};
        var upServices = {};

        upServices.getAllCountriesList = getAllCountriesList;
        upServices.getAllCurrenciesList = getAllCurrenciesList;
        upServices.getPlans = getPlans;
        upServices.formatCreditCardNumber = formatCreditCardNumber;
        upServices.submitUpgrade = submitUpgrade;

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

        /**
         * Parse and format imput to credit card like string
         * xxxx - xxxx - xxxx - xxxx ( - xxx )
         * @param ccInput
         * @returns {string}
         */
        function formatCreditCardNumber(ccInput) {
            var cardNumberError = false;

            ccInput = ccInput.replace(/\D/g,'');

            // Set maxim amount of digits that allowed for credit cards (19)
            if (ccInput.length > 19) ccInput = ccInput.substr(0,19);

            // Split to nice view 'xxxx - xxxx - xxxx - xxxx'
            var arr = ccInput.match(/.{1,4}/g);
            if (!arr) return;
            var str = '';
            for (var i = 0; i < arr.length; i++) {
                if (i != arr.length-1)	{
                    str = str + arr[i] + ' - ';
                } else {
                    str = str + arr[i];
                }
            }
            ccInput = str;

            return ccInput;
        }

        function submitUpgrade(planDetails, paymentDetails) {
            upgradePlanRestApi.upgrade.post({planDetails: planDetails, paymentDetails: paymentDetails})
        }
    }

})();


