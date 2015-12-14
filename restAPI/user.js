/**
 * User
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
    'postalAdress',
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

    app.post(restUrl, function (req, res) {
        req.user ? proceed() : notAuthExit(res);

        function proceed() {
            User.find({
                    where: {
                        id: req.user.id
                    }
                })
                .then(function (result) {
                    //for (var i = 0, len = userDetailsFields.length; i < len ; i++) {
                    //    if (req.body.params.indexOf(userDetailsFields[i]) > -1 ) {
                    //        console.log();
                    //        User.update({userDetailsFields[i]: req.body.params[userDetailsFields[i]]});
                    //    }
                    //}
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

