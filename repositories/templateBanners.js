"use strict";
var TemplateBanner = require('./../models').TemplateBanner;
var _ = require('lodash');

function create(params, callback) {
  validateForCreate(params, function(error, user) {
    if (Object.keys(error).length > 1) {
      return callback(error, user)
    } else {
      createTemplateBanner(params, function(error, result) {
        if (Object.keys(error).length > 1) {
          return callback(error, result);
        }else {
          return callback(null, result);
        }
      })
    }
  })
};

function createOrUpdate(params, callback) {
  TemplateBanner.find({ where: { page: params.page }}).done(function(result) {
    if(result) {
      result.update(params).then(function (result) {
        return callback(null, result);
      })
      .catch(function (err) {
        callback(err, result);
      });
    } else {
      create(params, callback);
    };
  });
}

function createTemplateBanner(params, callback) {
  TemplateBanner.create(params).then(function(result) {
    return callback(null, result);
  }).catch(TemplateBanner.sequelize.ValidationError, function(err) {
    return callback(prepareErrors(err), this);
  }).catch(function(err) {
    return callback(prepareErrors(err), this);
  });
}

function validateVirtualAttrs(params){
  let errors = {}
  return errors;
}

function validateForCreate(params, callback){
  let errorsObject = validateVirtualAttrs(params)
  TemplateBanner.build(params).validate().done(function(errors, user) {
    if (errors) {
      errorsObject = prepareErrors(errors, {});
      callback(errorsObject, this);
    }else{
      callback(errorsObject, user);
    }
  });
}

function prepareErrors(err, _errors_object) {
  let errors = (_errors_object || {})
  _.map(err.errors, function(n) {
    errors[n.path] = _.startCase(n.path) +" " + n.message;
  });
  return errors
};

module.exports = {
    create: create,
    templateBanner: TemplateBanner,
    createOrUpdate: createOrUpdate,
    createTemplateBanner: createTemplateBanner
}
