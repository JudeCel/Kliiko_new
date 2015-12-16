/**
 * Work with plans
 * GET /plans
 *
 * @type {exports|module.exports}
 */

var plans = {
    'single': {
        id: 1,
        name: 'Single Plan',
        price: 180
    },
    'monthly': {
        id: 2,
        name: 'Monthly Plan',
        price: 50
    },
    'annual': {
        id: 3,
        name: 'Annual Plan',
        price: 550
    }
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

