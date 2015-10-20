"use strict";
var User  = require('./../models').User;

function create(params, callback) {

  User.create(params).then(function(result) {
    return callback(null, result);
  }).catch(User.sequelize.ValidationError, function(err) {
    return callback(err, this);
  }).catch(function(err) {
    return callback(err, this);
  });
};

module.exports = {
    create: create
}
