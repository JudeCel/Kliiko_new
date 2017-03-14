'use strict';

const moment = require('moment');
const assert = require('chai').assert;
const currency = require('./../../lib/currency');

describe('LIB - Currency', function() {
  describe('#get', function() {
    it('can get default currency', function(done) {
      const params = {
        base: 'AUD',
        symbols: ['USD', 'GBP', 'CAD', 'EUR', 'NZD']
      };

      currency.get().then((data) => {
        assert.equal(data.base, params.base);
        assert.equal(data.date, moment().add(-1, 'days').format('YYYY-MM-DD'));
        assert.deepEqual(Object.keys(data.rates).sort(), params.symbols.sort());
        done();
      }).catch(done);
    });

    it('can get custom currency', function(done) {
      const params = {
        base: 'USD',
        symbols: ['EUR']
      };

      currency.get(params).then((data) => {
        assert.equal(data.base, params.base);
        assert.equal(data.date, moment().add(-1, 'days').format('YYYY-MM-DD'));
        assert.deepEqual(Object.keys(data.rates).sort(), params.symbols.sort());
        done();
      }).catch(done);
    });
  });
});
