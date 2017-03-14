'use strict';

const lookup = require('country-data').lookup;
const Bluebird = require('bluebird');
const currency = require('./currency');
const geoip = require('./geoip');

const DEFAULT_CURRENCY = 'AUD';

module.exports = { get };

// TODO: Needs tests
function get(params = {}) {
  return new Bluebird((resolve, reject) => {
    let clientCurrency;
    geoip.get(params).then((data) => {
      const country = lookup.countries({ name: data.country_name })[0];
      clientCurrency = country && country.currencies[0] || DEFAULT_CURRENCY;
      return currency.get(params);
    }).then((data) => {
      data.client = data.rates[clientCurrency] && clientCurrency || DEFAULT_CURRENCY;
      resolve(data);
    }).catch(reject);
  });
}
