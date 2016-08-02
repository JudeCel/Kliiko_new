'use strict';

var models = require('./../models');
var filters = require('./../models/filters');
var BrandProjectPreference = models.BrandProjectPreference;
var validators = require('./../services/validators');
var brandProjectConstants = require('../util/brandProjectConstants');

var q = require('q');
var _ = require('lodash');

const MESSAGES = {
  notFound: 'Scheme not found!',
  removed: 'Scheme removed successfully!',
  created: 'Scheme created successfully!',
  copied: 'Scheme copied successfully!',
  updated: 'Scheme updated successfully!',
  notValid: 'Not valid colour',
  notFromList: 'Colour is not from the list'
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
function findScheme(params, accountId) {
  let deferred = q.defer();

  BrandProjectPreference.find({ where: { id: params.id, accountId: accountId } }).then(function(scheme) {
    if(scheme) {
      deferred.resolve(simpleParams(scheme));
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(BrandProjectPreference.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

function findAllSchemes(accountId) {
  let deferred = q.defer();

  BrandProjectPreference.findAll({ where: { accountId: accountId } }).then(function(schemes) {
    deferred.resolve(simpleParams(schemes));
  }).catch(BrandProjectPreference.sequelize.ValidationError, function(error) {
    deferred.reject(filters.errors(error));
  }).catch(function(error) {
    deferred.reject(error);
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
        deferred.resolve(simpleParams(result, MESSAGES.created));
      }).catch(BrandProjectPreference.sequelize.ValidationError, function(error) {
        deferred.reject(filters.errors(error));
      }).catch(function(error) {
        deferred.reject(error);
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
      deferred.reject(error);
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
    deferred.reject(error);
  });

  return deferred.promise;
}

function updateScheme(params, accountId) {
  let deferred = q.defer();
  let validParams = validateParams(params, VALID_ATTRIBUTES.manage);
  let errors = {};
  validateColours(validParams.colours, errors);

  if(_.isEmpty(errors)) {
    findScheme(params, accountId).then(function(result) {
      result.data.update(validParams, { returning: true }).then(function(scheme) {
        deferred.resolve(simpleParams(scheme, MESSAGES.updated));
      }).catch(BrandProjectPreference.sequelize.ValidationError, function(error) {
        deferred.reject(filters.errors(error));
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

function removeScheme(params, accountId) {
  let deferred = q.defer();

  findScheme(params, accountId).then(function(result) {
    result.data.destroy().then(function() {
      deferred.resolve(simpleParams(null, MESSAGES.removed));
    }).catch(BrandProjectPreference.sequelize.ValidationError, function(error) {
      deferred.reject(filters.errors(error));
    }).catch(function(error) {
      deferred.reject(error);
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
      updateScheme({ id: result.data.id, name: originalName + ' #' + result.data.id }, accountId).then(function(result) {
        deferred.resolve(simpleParams(result.data, MESSAGES.copied));
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
  let object = { chatRoom: [] };

  _.map(brandProjectConstants.preferenceColours, function(value, key) {
    object.chatRoom.push({
      title: _.startCase(key),
      model: key
    });
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
  let constantValues = _.cloneDeep(brandProjectConstants.preferenceColours);
  return _.assign(constantValues, colours || {});
}

function validateColours(colours, errors) {
  let regex = new RegExp(brandProjectConstants.hexRegex);
  _.map(colours, function(value, key) {
    if(!regex.test(value)) {
      errors[key] = _.startCase(key) + ': ' + MESSAGES.notValid;
    }
  });
}

function simpleParams(data, message) {
  return { data: data, message: message };
};

module.exports = {
  messages: MESSAGES,
  manageFields: manageFields,
  findScheme: findScheme,
  findAllSchemes: findAllSchemes,
  createScheme: createScheme,
  createDefaultForAccount: createDefaultForAccount,
  updateScheme: updateScheme,
  removeScheme: removeScheme,
  copyScheme: copyScheme,
  canCreateCustomColors: canCreateCustomColors
};
