'use strict';

var models = require('./../models');
var Account = models.Account;
var BrandProjectPreference = models.BrandProjectPreference;

var brandProjectConstants = require('../util/brandProjectConstants');

var q = require('q');
var _ = require('lodash');
var config = require('config');

const MESSAGES = {
  notFound: 'Scheme not found!',
  removed: 'Scheme removed successfully!',
  created: 'Scheme created successfully!',
  copied: 'Scheme copied successfully!',
  updated: 'Scheme updated successfully!',
  notValid: 'Not valid colour'
};

const VALID_ATTRIBUTES = {
  manage: [
    'id',
    'name',
    'accountId',
    'colours'
  ]
};

// Exports
function findScheme(params, account) {
  let deferred = q.defer();

  BrandProjectPreference.find({ where: { id: params.id, accountId: account.id } }).then(function(scheme) {
    if(scheme) {
      deferred.resolve(simpleParams(scheme));
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(BrandProjectPreference.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function findAllSchemes(account) {
  let deferred = q.defer();

  BrandProjectPreference.findAll({ where: { accountId: account.id } }).then(function(schemes) {
    deferred.resolve(simpleParams(schemes));
  }).catch(BrandProjectPreference.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function createScheme(params, account) {
  let deferred = q.defer();

  params.accountId = account.id;
  let validParams = validateParams(params, VALID_ATTRIBUTES.manage);
  let errors = {};
  validateColours(validParams.colours, errors);

  if(_.isEmpty(errors)) {
    BrandProjectPreference.create(validParams).then(function(result) {
      deferred.resolve(simpleParams(result, MESSAGES.created));
    }).catch(BrandProjectPreference.sequelize.ValidationError, function(error) {
      deferred.reject(prepareErrors(error));
    }).catch(function(error) {
      deferred.reject(error);
    });
  }
  else {
    deferred.reject(errors);
  }

  return deferred.promise;
};

function updateScheme(params, account) {
  let deferred = q.defer();
  let validParams = validateParams(params, VALID_ATTRIBUTES.manage);
  let errors = {};
  validateColours(validParams.colours, errors);

  if(_.isEmpty(errors)) {
    findScheme(params, account).then(function(result) {
      result.data.update(validParams, { returning: true }).then(function(scheme) {
        deferred.resolve(simpleParams(scheme, MESSAGES.updated));
      }).catch(BrandProjectPreference.sequelize.ValidationError, function(error) {
        deferred.reject(prepareErrors(error));
      }).catch(function(error) {
        deferred.reject(error);
      });
    }, function(error) {
      deferred.reject(error);
    });
  }
  else {
    deferred.reject(errors);
  }

  return deferred.promise;
}

function removeScheme(params, account) {
  let deferred = q.defer();

  findScheme(params, account).then(function(result) {
    result.data.destroy().then(function() {
      deferred.resolve(simpleParams(null, MESSAGES.removed));
    }).catch(BrandProjectPreference.sequelize.ValidationError, function(error) {
      deferred.reject(prepareErrors(error));
    }).catch(function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function copyScheme(params, account) {
  let deferred = q.defer();

  findScheme(params, account).then(function(result) {
    delete result.data.dataValues.id;

    createScheme(result.data.dataValues, account).then(function(result) {
      deferred.resolve(simpleParams(result.data, MESSAGES.copied));
    }, function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function manageFields() {
  let object = { chatRoom: [], participants: [] };

  _.map(brandProjectConstants.preferenceColours({}), function(value, key) {
    if(key == 'participants') {
      _.map(value, function(value, key) {
        object.participants.push({
          model: key
        });
      });
    }
    else {
      object.chatRoom.push({
        title: _.startCase(key),
        model: key
      });
    }
  });

  return object;
}

// Helpers
function pushToObjectArray(object, attr, type) {
  object[type].push({
    title: _.startCase(attr.substring('colour_'.length)),
    model: attr
  });
}

function validateParams(params, attributes) {
  let newParams = _.pick(params, attributes);
  newParams.colours = brandProjectConstants.preferenceColours(newParams.colours || {});

  return newParams;
};

function validateColours(colours, errors) {
  let regex = new RegExp(brandProjectConstants.hexRegex);
  _.map(colours, function(value, key) {
    if(_.isObject(value)) {
      _.map(value, function(subvalue, subkey) {
        if(!regex.test(subvalue)) {
          errors[subkey] = _.startCase(key + subkey) + ': ' + MESSAGES.notValid;
        }
      });
    }
    else {
      if(!regex.test(value)) {
        errors[key] = _.startCase(key) + ': ' + MESSAGES.notValid;
      }
    }
  });
}

function simpleParams(data, message) {
  return { data: data, message: message };
};

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    let message = n.message.replace(n.path, '');
    if(message == ' cannot be null') {
      message = ' cannot be empty';
    }
    errors[n.path] = _.startCase(n.path) + ':' + message;
  });
  return errors;
};

module.exports = {
  messages: MESSAGES,
  manageFields: manageFields,
  findScheme: findScheme,
  findAllSchemes: findAllSchemes,
  createScheme: createScheme,
  updateScheme: updateScheme,
  removeScheme: removeScheme,
  copyScheme: copyScheme
};
