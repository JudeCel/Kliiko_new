'use strict';

const request = require('request');
const Bluebird = require('bluebird');

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
  const base = params.base || 'AUD';
  const symbols = (params.symbols || ['USD', 'GBP', 'CAD', 'EUR', 'NZD']).join(',');
  return `http://api.fixer.io/latest?base=${base}&symbols=${symbols}`;
}
