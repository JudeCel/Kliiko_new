'use strict';

const assert = require('chai').assert;
const geoip = require('./../../lib/geoip');

describe('LIB - GeoIP', function() {
  describe('#get', function() {
    it('can get ip information', function(done) {
      const params = {
        ip: '8.8.8.8'
      };

      geoip.get(params).then((data) => {
        assert.equal(data.ip, params.ip);
        assert.equal(data.country_code, 'US');
        done();
      }).catch(done);
    });
  });
});
