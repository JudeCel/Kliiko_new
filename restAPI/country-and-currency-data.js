/**
 * Country and currency data
 * GET /country-and-currency-data/countries
 * GET /country-and-currency-data/currencies
 *
 * @type {exports|module.exports}
 */

var countryData  = require('country-data');
var config = require('config');
var unirest = require('unirest');

module.exports = function(app,restUrl) {
    var restUrl = restUrl+'/country-and-currency-data';

    /**
     * GET all countries data
     */
    app.get(restUrl+'/countries', function (req, res) {
        req.user ? proceed() : notAuthExit(res);

        function proceed() {
            res.send(countryData.countries);
        }

    });

    /**
     * GET all currencies data
     */
    app.get(restUrl+'/currencies', function (req, res) {
        req.user ? proceed() : notAuthExit(res);

        function proceed() {
            var openExchangeApiUrl= `https://openexchangerates.org/api/latest.json?app_id=${config.get('openexchangeratesAppId')}`;

            unirest.get(openExchangeApiUrl).
                header({'Content-Type': 'application/json'})
                .end(function(response) {

                    if (response.statusCode == 200) {
                        var all = countryData.currencies;
                        // remove .all object to return only most popular one
                        delete all.all;

                        var output = prepareCurrenciesOutput(all, response.body.rates) ;
                        res.send(output);
                    } else {
                        res.send({error:'Something wrong with openexchange output', response: response.body})
                    }

                });
        }

    });

    //Common not authorized message
    function notAuthExit(res) {
        res.status(403).send('not authorized');
    }

    /**
     * Add 'rates' property to all currencies data object
     * @param allCurrencies {object}
     * @param rates {object}
     * @returns {object}
     */
    function prepareCurrenciesOutput(allCurrencies, rates) {
        for (var currency in allCurrencies) {
            console.log(rates[currency]);
            if (rates[currency]) {
                allCurrencies[currency].rate = rates[currency]
            }
        }

        return allCurrencies;
    }


};
