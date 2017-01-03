/**
 * Credit Card Module is based on Stripe.js
 * https://stripe.com/docs/stripe.js
 */

(function () {
  'use strict';

  angular.module('CreditCard', []).factory('CreditCard', CreditCardFactory);

  CreditCardFactory.$inject = ['$q','authResource', 'dbg'];
  function CreditCardFactory($q, authResource, dbg)  {


    var _number, _holderName, _expMonth, _expYear, _cvv;
    _number = _holderName = _expMonth = _expYear = _cvv = {
      value: null,
      valid: false,
      error: null
    };

    var CreditCardModel = function() {

      var self = this;

      self.number = getSetNumber;
      self.holderName = getSetHolderName;
      self.expMonth = getSetExpMonth;
      self.expYear = getSetExpYear;
      self.cvv = getSetCvv;

      dbg.log2('#CreditCard > new CreditCard Instance created');

      init();

      function init(){
        //init stripe
        Stripe.setPublishableKey(globalSettings.thirdyPartServices.stripe.publishableKey);
      }

    };

    CreditCardModel.prototype.validateCardNumber = validateCardNumber;
    CreditCardModel.prototype.validateExpiry = validateExpiry;
    CreditCardModel.prototype.validateCVV = validateCVV;
    CreditCardModel.prototype.getCardType = getCardType;

    return CreditCardModel;

    ///////////////////////


    function getSetNumber(number) {
      // Get
      if (!number) {
        if (_number.valid) return _number.value;
        return _number.error;
      }

      // Set
      var valid = validateCardNumber(number);

      if (valid) {
        _number.value = number;
        _number.valid = true;
        _number.error = null;

        return;
      }

      _number.value = number;
      _number.valid = false;
      _number.error = 'Credit Card Number Is Not Valid';

      return {error: _number.error + ' > '+ _number.value}
    }

    function getSetHolderName(name) {
      // Get
      if (!name) return _name.error;

      // Set
      _holderName.value = name;

    }

    function getSetExpMonth(month) {
      // Get
      if (!month) {
        if (_expMonth.valid) return _expMonth.value;
        return _expMonth.error;
      }

      // Set
      var valid = function(month) {
        if ( parseInt(month) >= 1 &&  parseInt(month) <= 12 ) return true;
        return false
      };

      if (valid) {
        _expMonth.value = month;
        _expMonth.valid = true;
        _expMonth.error = null;

        return;
      }

      _expMonth.value = month;
      _expMonth.valid = false;
      _expMonth.error = 'Month is not valid';

      return {error: _expMonth.error + ' > '+ _expMonth.value}
    }

    function getSetExpYear(year) {
      // Get
      if (!year) {
        if (_expYear.valid) return _expYear.value;
        return _expYear.error;
      }

      // Set
      var valid = function(year) {
        var currentYear = new Date().getFullYear();
        if ( curretnYear >= year ) return true;
        return false;
      };

      if (valid) {
        _expYear.value = year;
        _expYear.valid = true;
        _expYear.error = null;

        return;
      }

      _expYear.value = year;
      _expYear.valid = false;
      _expYear.error = 'Year is not valid';

      return {error: _expYear.error + ' > '+ _expYear.value}
    }
    function getSetCvv(cvv) {
      // Get
      if (!cvv) {
        if (cvv.valid) return number.value;
        return cvv.error;
      }

      // Set
      var valid = validateCVV(cvv);

      if (valid) {
        _cvv.value = cvv;
        _cvv.valid = true;
        _cvv.error = null;

        return;
      }

      _cvv.value = cvv;
      _cvv.valid = false;
      _cvv.error = 'CVV Is Not Valid';

      return {error: _cvv.error  + ' > '+ _cvv.value}
    }

    /**
     * Fast card number validation
     * @param number {string || number} - card number
     * @returns {boolean}
     */
    function validateCardNumber(number) {
      return Stripe.card.validateCardNumber(number);
    }

    /**
     * Validate Expiry month and year
     * @param month {string || number}
     * @param year {string || number}
     * @returns {boolean}
     */
    function validateExpiry(month, year) {
      return Stripe.card.validateExpiry(month, year);
    }

    /**
     * Validate CVV || CVC || CID
     * @param cvv {string || number}
     * @returns {boolean}
     */
    function validateCVV(cvv) {
      return Stripe.card.validateCVC(cvv);
    }

    /**
     * Get cart type: Visa MC, AXP etc
     * @param number {string || number} - card number
     * @returns {string}
     */
    function getCardType(number) {
      return Stripe.card.getCardType(number);
    }
  }



})();
