'use strict';

var MessagesUtil = require('./../util/messages');
var models = require('./../models');
var filters = require('./../models/filters');
var BrandProjectPreference = models.BrandProjectPreference;
var validators = require('./../services/validators');
var brandProjectConstants = require('../util/brandProjectConstants');

var q = require('q');
var _ = require('lodash');

const VALID_ATTRIBUTES = {
  manage: [
    'id',
    'name',
    'accountId',
    'colours',
    'type'
  ]
};

// Exports
function findScheme(params, accountId) {
  let deferred = q.defer();

  BrandProjectPreference.find({ where: { id: params.id, accountId: accountId } }).then(function(scheme) {
    if(scheme) {
      deferred.resolve(simpleParams(scheme));
    }
    else {
      deferred.reject(MessagesUtil.brandColour.notFound);
    }
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function findAllSchemes(accountId) {
  let deferred = q.defer();

  BrandProjectPreference.findAll({ where: { accountId: accountId }, order: 'name' }).then(function(schemes) {
    deferred.resolve(simpleParams(schemes));
  }).catch(function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
};

function createScheme(params, accountId) {
  let deferred = q.defer();

  canCreateCustomColors(accountId).then(function() {
    params.accountId = accountId;
    let validParams = validateParams(params, VALID_ATTRIBUTES.manage);
    let errors = {};
    validateColours(validParams.colours, errors);

    if(_.isEmpty(errors)) {
      BrandProjectPreference.create(validParams).then(function(result) {
        deferred.resolve(simpleParams(result, MessagesUtil.brandColour.created));
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
      });
    }
    else {
      deferred.reject(errors);
    }
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function createDefaultForAccount(params, t) {
  let deferred = q.defer();

  let errors = {};
  let validParams = validateParams(params, VALID_ATTRIBUTES.manage);
  validateColours(validParams.colours, errors);

  if(_.isEmpty(errors)) {
    BrandProjectPreference.create(validParams, { transaction: t }).then(function(result) {
      deferred.resolve();
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }
  else {
    deferred.reject(errors);
  }

  return deferred.promise;
}

function canCreateCustomColors(accountId) {
  let deferred = q.defer();

  validators.planAllowsToDoIt(accountId, 'brandLogoAndCustomColors').then(function() {
    deferred.resolve();
  }, function(error) {
    deferred.reject(filters.errors(error));
  });

  return deferred.promise;
}

function resetToDefaultScheme(params, accountId) {
  params.colours = {};
  params.colours = assignDefaultColours(params.colours);
  return updateScheme(params, accountId);
}

function updateScheme(params, accountId) {
  let deferred = q.defer();
  let validParams = validateParams(params, VALID_ATTRIBUTES.manage);
  let errors = {};
  validateColours(validParams.colours, errors);

  if(_.isEmpty(errors)) {
    findScheme(params, accountId).then(function(result) {
      result.data.update(validParams, { returning: true }).then(function(scheme) {
        deferred.resolve(simpleParams(scheme, MessagesUtil.brandColour.updated));
      }).catch(function(error) {
        deferred.reject(filters.errors(error));
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

function removeScheme(params, accountId) {
  let deferred = q.defer();

  findScheme(params, accountId).then(function(result) {
    result.data.destroy().then(function() {
      deferred.resolve(simpleParams(null, MessagesUtil.brandColour.removed));
    }).catch(function(error) {
      deferred.reject(filters.errors(error));
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function copyScheme(params, accountId) {
  let deferred = q.defer();

  findScheme(params, accountId).then(function(result) {
    delete result.data.dataValues.id;
    let originalName = 'Copy of ' + result.data.dataValues.name;
    result.data.dataValues.name = originalName + new Date().getTime();

    createScheme(result.data.dataValues, accountId).then(function(result) {
      result.data.update({ name: originalName + ' #' + result.data.id }, { returning: true }).then(function(result) {
        deferred.resolve(simpleParams(result, MessagesUtil.brandColour.copied));
      }, function(error) {
        deferred.reject(filters.errors(error));
      });
    }, function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function manageFields() {
  let object = { chatRoom: [], email: [] };

  _.each(brandProjectConstants.preferenceColours, function (value, key) {
    if (key == "email") {
      _.each(value, function (emailValue, emailKey) {
        object.email.push({
          title: _.startCase(emailKey),
          model: emailKey,
          colour: emailValue
        });
      });
    } else {
      object.chatRoom.push({
        title: _.startCase(key),
        model: key,
        colour: value
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
  newParams.colours = assignDefaultColours(newParams.colours);

  return newParams;
};

function assignDefaultColours(colours) {
  let object = { };

  _.each(brandProjectConstants.preferenceColours, function (value, key) {
    if (typeof(value) == "object") {
      _.each(value, function (objValue, objKey) {
        object[objKey] = objValue;
      });
    } else {
      object[key] = value;
    }
  });

  return _.assign(object, colours || {});
}

function validateColours(colours, errors) {
  let regex = new RegExp(brandProjectConstants.hexRegex);
  _.map(colours, function(value, key) {
    if(!regex.test(value)) {
      errors[key] = _.startCase(key) + ': ' + MessagesUtil.brandColour.notValid;
    }
  });
}

function simpleParams(data, message) {
  return { data: data, message: message };
};

module.exports = {
  messages: MessagesUtil.brandColour,
  manageFields: manageFields,
  findScheme: findScheme,
  findAllSchemes: findAllSchemes,
  createScheme: createScheme,
  createDefaultForAccount: createDefaultForAccount,
  resetToDefaultScheme: resetToDefaultScheme,
  updateScheme: updateScheme,
  removeScheme: removeScheme,
  copyScheme: copyScheme,
  canCreateCustomColors: canCreateCustomColors
};
