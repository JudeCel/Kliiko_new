'use strict';

const lookup = require('country-data').lookup;
const Bluebird = require('bluebird');
const currency = require('./currency');
const geoip = require('./geoip');
const constants = require('./../util/constants');

module.exports = { get };

function get(params = {}) {
  return new Bluebird((resolve, reject) => {
    let clientCurrency;
    geoip.get(params).then((data) => {
      const country = findCountry(data.country_name);
      clientCurrency = country && country.currencies[0] || constants.defaultCurrency;
      return currency.get(params);
    }).then((data) => {
      data.client = data.rates[clientCurrency] && clientCurrency || constants.defaultCurrency;
      resolve(data);
    }).catch(reject);
  });
}

function findCountry(name) {
  return lookup.countries({ name })[0]
}
