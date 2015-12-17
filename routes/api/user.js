/**
 * User
 * GET - fetch user data
 * POST /update
 *
 */

 "use strict";
 var User = require('./../../models').User;


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


function userPost(req, res, next) {
  User.find({
    where: {
      id: req.user.id
    }
  }).then(function (result) {
    result.update(req.body);
    res.send(req.body);
  }).catch(function (err) {
    res.send({error:err});
  });
}

function userGet(req, res, next) {
  User.find({
    where: {
      id: req.user.id
    },
    attributes: userDetailsFields
  }).then(function (result) {
    res.send(result);
  }).catch(function (err) {
    res.send({error: err});
  });
}

module.exports = {
  userGet: userGet,
  userPost: userPost,
}
