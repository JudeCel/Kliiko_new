"use strict";
var User  = require('./../models').User;
var _ = require('lodash');
var bcrypt = require('bcrypt');

function create(params, callback) {
  User.create(params).then(function(result) {
    return callback(null, result);
  }).catch(User.sequelize.ValidationError, function(err) {
    return callback(err, this);
  }).catch(function(err) {
    return callback(err, this);
  });
};

function compare_password(email, password, callback) {
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

function prepare_erros(error) {
  let errors = {};
  _.map(error.errors, function(n) {
    errors[n.path] = _.startCase(n.path) +" " +n.message;
  });
  return errors
};

function prepare_params(req, errors) {
  return _.assign({
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
    compare_password: compare_password,
    prepare_erros: prepare_erros,
    prepare_params: prepare_params
}
