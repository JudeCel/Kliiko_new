/**
 * Work with plans
 * GET /plans
 *
 * @type {exports|module.exports}
 */

var plans = {
    'single': {price: 180 },
    'monthly': {price: 50 },
    'annual': {price: 550 }
};


module.exports = function(app,restUrl) {
    var restUrl = restUrl+'/plans';

    /**
     * GET all plans data
     */
    app.get(restUrl, function (req, res) {
        req.user ? proceed() : notAuthExit(res);

        function proceed() {
            res.send(plans);
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

