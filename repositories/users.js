"use strict";
var User  = require('./../models').User;
var _ = require('lodash');
var bcrypt = require('bcrypt');

function create(params, callback) {
  User.create(params).then(function(result) {
    return callback(null, result);
  }).catch(User.sequelize.ValidationError, function(err) {
    return callback(prepareErrors(err, params), this);
  }).catch(function(err) {
    return callback(prepareErrors(err, params), this);
  });
};

function comparePassword(email, password, callback) {
  User.find({where: {email: email}}).done(function(result){
    if (result) {
      bcrypt.compare(password, result.encrypted_password, function(err, res) {
        if (err) { return callback(true, null) }
        if (res == true) {
          callback(null, result);
        }
      });
    }else {
      callback(true, null);
    };
  });
};

function prepareErrors(error, params) {
  let errors = validateVirtualAttrs(params)
  _.map(error.errors, function(n) {
    errors[n.path] = _.startCase(n.path) +" " +n.message;
  });
  return errors
};


function validateVirtualAttrs(params){
  let errors = {}
  console.log(params);
  if ((params['t_and_c'] !== 'on')) {
    errors['t_and_c'] = 'Need Accept TOS'
  }
  if ((params['password_confirmation'] !== params['password'])) {
    errors['password'] = 'Password need to be eql with Password Confirmation'
    errors['password_confirmation'] = 'Password confirmation need to be eql with Password'
  }
  return errors
}

function prepareParams(req, errors) {
  return _.assign({
    user: req.user,
    title: 'Registration',
    display_name: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    t_and_c: '',
    errors: (errors || {})
  }, req.body, req.query);
}

module.exports = {
    create: create,
    user: User,
    comparePassword: comparePassword,
    prepareParams: prepareParams
}
