/**
 * User
 * POST /update
 *
 */

var users = require('./../services/users');


module.exports = function(app,restUrl) {
    var restUrl = restUrl+'/user';

    /**
     * GET all plans data
     */
    app.post(restUrl, function (req, res) {
        req.user ? proceed() : notAuthExit(res);

        function proceed() {

            if (!req.params.id) {
                res.send({error: 'Required parameter "id" is missed'});
                return;
            }
            res.send(users);
        }

    });


    //Common not authorized message
    function notAuthExit(res) {
        res.status(403).send('not authorized');
    }


};

