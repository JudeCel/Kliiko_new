'use strict';

const assert = require('chai').assert;
const currency = require('./../../lib/currency');
const constants = require('./../../util/constants');


describe('LIB - Currency', function() {
  describe('#get', function() {
    it('can get default currency', function(done) {
      const params = {
        base: constants.defaultCurrency,
        symbols: constants.supportedCurrencies
      };

      currency.get().then((data) => {
        assert.equal(data.base, params.base);
        assert.deepEqual([constants.defaultCurrency, ...Object.keys(data.rates)].sort(), params.symbols.sort());
        done();
      }).catch(done);
    });

    it('can get custom currency', function(done) {
      const params = {
        base: constants.defaultCurrency,
        symbols: ['EUR']
      };

      currency.get(params).then((data) => {
        assert.equal(data.base, params.base);
        assert.deepEqual(Object.keys(data.rates).sort(), params.symbols.sort());
        done();
      }).catch(done);
    });
  });
});
