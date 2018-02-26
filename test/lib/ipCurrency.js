'use strict';

const assert = require('chai').assert;
const ipCurrency = require('./../../lib/ipCurrency');
const constants = require('./../../util/constants');


describe('LIB - IPCurrency', function() {
  describe('#get', function() {
    it('can get currency data from IP', function(done) {
      const params = {
        ip: '8.8.8.8'
      };

      ipCurrency.get(params).then((data) => {
        assert.equal(data.base, constants.defaultCurrency);
        assert.equal(data.client, constants.defaultCurrency);
        done();
      }).catch(done);
    });
  });
});
