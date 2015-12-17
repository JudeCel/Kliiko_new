/**
 * User
 * GET - fetch user data
 * POST /update
 *
 */

var User = require('./../models').User;

var userDetailsFields = [
    'firstName',
    'lastName',
    'email',
    'gender',
    'mobile',
    'landlineNumber',
    'postalAddress',
    'city',
    'state',
    'postcode',
    'country',
    'companyName',
    'tipsAndUpdate'
];

module.exports = function(app,restUrl) {
    var restUrl = restUrl+'/user';

    /**
     * GET all user data
     */
    app.get(restUrl, function (req, res) {
        req.user ? proceed() : notAuthExit(res);

        function proceed() {
            //res.send(req.body.params);
            User.find({
                    where: {
                        id: req.user.id
                    },
                    attributes: userDetailsFields
                })
                .then(function (result) {
                    res.send(result);
                    //result.update({name: "newname"})
                })
                .catch(function (err) {
                    res.send({error:err});

                });

        }

    });

    /**
     * POST will update user details
     */
    app.post(restUrl, function (req, res) {
        req.user ? proceed() : notAuthExit(res);

        function proceed() {
            User.find({
                    where: {
                        id: req.user.id
                    }
                })
                .then(function (result) {
                    result.update(req.body);
                    res.send(req.body);
                })
                .catch(function (err) {
                    res.send({error:err});

                });

        }

    });


    //Common not authorized message
    function notAuthExit(res) {
        res.status(403).send('not authorized');
    }


};

