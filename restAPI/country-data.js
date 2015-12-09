var countryData  = require('country-data');


module.exports = function(app,restUrl) {
    var restUrl = restUrl+'/country-data';

    /**
     * GET all countries data
     */
    app.get(restUrl,/* cors(),*/ function (req, res) {
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
            res.send(countryData.currencies);
        }

    });

    //Common not authorized message
    function notAuthExit(res) {
        res.status(403).send('not authorized');
    }


};

