'use strict';

const request = require('request');
const Bluebird = require('bluebird');
const constants = require('./../util/constants');

const DEFAULT_CURRENCY = 'USD';

module.exports = { get };

function get(params = {}) {
  return new Bluebird((resolve, reject) => {
    request.get(options(params), (error, res, data) => {
      error ? reject(error) : resolve(data);
    });
  });
}

function options(params) {
  return {
    url: builder(params),
    json: true
  };
}

function builder(params) {
  const base = params.base || DEFAULT_CURRENCY;
  const symbols = (params.symbols || constants.supportedCurrencies).join(',');
  return url(base, symbols);
}

function url(base, symbols) {
  return `http://api.fixer.io/latest?base=${base}&symbols=${symbols}`;
}
