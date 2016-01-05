(function () {
  'use strict';
  angular.module('KliikoApp').factory('upgradePlanServices', upgradePlanServices);

  upgradePlanServices.$inject = ['$q', 'globalSettings', '$resource', 'dbg', '$ocLazyLoad', '$injector'];
  function upgradePlanServices($q, globalSettings, $resource, dbg, $ocLazyLoad, $injector) {
    var cache = {};
    var upServices = {};
    var creditCard, chargebee;

    var upgradePlanRestApi = {
      getAllCountries: $resource(globalSettings.restUrl + '/countries', {}, {post: {method: 'POST'}}),
      getAllCurrencies: $resource(globalSettings.restUrl + '/currencies', {}, {post: {method: 'POST'}}),
      getPlans: $resource(globalSettings.restUrl + '/plans', {}, {post: {method: 'POST'}}),
      upgrade: $resource(globalSettings.restUrl + '/upgrade', {}, {post: {method: 'POST'}}),
      chargebee: $resource(globalSettings.restUrl + globalSettings.paymentModules.chargebee.apiEndPoint, {}, {post: {method: 'POST'}})
    };



    upServices.getAllCountriesList = getAllCountriesList;
    upServices.getAllCurrenciesList = getAllCurrenciesList;
    upServices.getPlans = getPlans;
    upServices.formatCreditCardNumber = formatCreditCardNumber;
    upServices.submitUpgrade = submitUpgrade;
    upServices.getYearsArray = getYearsArray;
    upServices.getMonthsArray = getMonthsArray;
    upServices.initPaymentModule = initPaymentModule;


    upServices.creditCard = {
      init: initCreditCardServices,
      createToken: createCreditCardToken
    };

    return upServices;


    function getAllCountriesList() {
      var deferred = $q.defer();

      if (cache.allCountries) {
        deferred.resolve(cache.allCountries);
        dbg.log2('#upgradePlanServices > getAllCountriesList > return cached value');
        return deferred.promise;
      }

      dbg.log2('#upgradePlanServices > getAllCountriesList > make rest call');
      upgradePlanRestApi.getAllCountries.get({}, function (res) {
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
      upgradePlanRestApi.getAllCurrencies.get({}, function (res) {
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
      upgradePlanRestApi.getPlans.get({}, function (res) {
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

      ccInput = ccInput.replace(/\D/g, '');

      // Set maxim amount of digits that allowed for credit cards (19)
      if (ccInput.length > 19) ccInput = ccInput.substr(0, 19);

      // Split to nice view 'xxxx - xxxx - xxxx - xxxx'
      var arr = ccInput.match(/.{1,4}/g);
      if (!arr) return;
      var str = '';
      for (var i = 0; i < arr.length; i++) {
        if (i != arr.length - 1) {
          str = str + arr[i] + ' - ';
        } else {
          str = str + arr[i];
        }
      }
      ccInput = str;

      return ccInput;
    }

    function  getYearsArray() {
      var currentYear = parseInt(moment().format('YYYY'));
      var output = [currentYear];

      for (var i = 0, len = 6; i < len ; i++) {
        output.push(currentYear+1+i);
      }

      return output;
    }
    function getMonthsArray() {
      return [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
    }

    function initCreditCardServices() {
      if (creditCard) return;

      creditCard = new CreditCard();

    }

    function createCreditCardToken(creditcardDetails) {
      var deferred = $q.defer();
      deferred.resolve();

      if(typeof Stripe === 'undefined'){
        dbg.error('upgradePlanServices > createCreditCardToken > Stripe is not loaded!!!, https://stripe.com/docs/stripe.js#createToken');
        deferred.reject({error: 'Application Error!'});
        return deferred.promise;
      }

      Stripe.card.createToken({
        number: creditcardDetails.number,
        cvc: creditcardDetails ,
        exp_month: creditcardDetails.expMonth,
        exp_year: creditcardDetails.expYear,
        name: creditcardDetails.holderName
      }, function(status, response) {

        if (response.error) {
          deferred.reject({error: response.error});
          return deferred.promise;
        }

        deferred.resolve(response);

        console.log(status, response);
      });

      return deferred.promise;

    }


    /**
     * Submit Payment
     * @param planDetails
     * @param paymentDetails
     */
    function submitUpgrade(planDetails, paymentDetails, userData) {
      var deferred = $q.defer();

      dbg.log2('upgradePlanServices > submitUpgrade > payment details submitted to back end ', planDetails, paymentDetails);



      if (paymentDetails.paymentMethod === 'chargebee') {



        upgradePlanRestApi.chargebee.post({}, {
          planDetails: planDetails,
          paymentDetails: paymentDetails,
          userData:userData,
          pages: {
            redirect_url: window.location.href+'?step=5',
            cancel_url: window.location.href,
          }
        },  function(res) {
            if (res.error) {
              deferred.reject(res.error);
            } else {
              deferred.resolve(res);
            }
        });

      }

      return deferred.promise;

    }

    function initPaymentModule() {
      $ocLazyLoad.load('/js/ngApp/modules/chargebee/chargebee.js').then(function() {
        chargebee = $injector.get('chargebee');
        dbg.log2('#UpgradePlanController > validateStep2 > chargebee is ready to use');
      });
    }
  }

})();



