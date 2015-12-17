/**
 * Country and currency data
 * GET /country-and-currency-data/countries
 * GET /country-and-currency-data/currencies
 *
 * @type {exports|module.exports}
 */

"use strict";
var countryData  = require('country-data');
var config = require('config');
var unirest = require('unirest');

function countries(req, res, next) {
  res.send(countryData.countries);
}
    /**
     * GET all currencies data
     */

function currencies(req, res, next) {
    let openExchangeApiUrl = `https://openexchangerates.org/api/latest.json?app_id=${config.get('openexchangeratesAppId')}`;

    unirest.get(openExchangeApiUrl).
        header({'Content-Type': 'application/json'})
        .end(function(response) {

            if (response.statusCode == 200) {
                let all = countryData.currencies;
                // remove .all object to return only most popular one
                delete all.all;

                let output = prepareCurrenciesOutput(all, response.body.rates) ;
                res.send(output);
            } else {
                res.send({error:'Something wrong with openexchange output', response: response.body})
            }

        });
}


    /**
     * Add 'rates' property to all currencies data object
     * @param allCurrencies {object}
     * @param rates {object}
     * @returns {object}
     */
    function prepareCurrenciesOutput(allCurrencies, rates) {
        for (var currency in allCurrencies) {
            if (rates[currency]) {
                allCurrencies[currency].rate = rates[currency]
            }
        }

        return allCurrencies;
    }



module.exports = {
  countries: countries,
  currencies: currencies
}
