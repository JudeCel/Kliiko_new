'use strict';

const assert = require('chai').assert;
const ipCurrency = require('./../../lib/ipCurrency');

const DEFAULT_CURRENCY = 'USD';

describe('LIB - IPCurrency', function() {
  describe('#get', function() {
    it('can get currency data from IP', function(done) {
      const params = {
        ip: '8.8.8.8'
      };

      ipCurrency.get(params).then((data) => {
        assert.equal(data.base, DEFAULT_CURRENCY);
        assert.equal(data.client, DEFAULT_CURRENCY);
        done();
      }).catch(done);
    });
  });
});
