'use strict';

var models = require('./../models');
var Account = models.Account;
var Session = models.Session;
var BrandProjectPreference = models.BrandProjectPreference;

var q = require('q');
var _ = require('lodash');
var config = require('config');

const MESSAGES = {
  notFound: 'Scheme not found!',
  removed: 'Scheme removed successfully!',
  created: 'Scheme created successfully!',
  copied: 'Scheme copied successfully!'
};

const VALID_ATTRIBUTES = {
  manage: [
    'id',
    'name',
    'sessionId',
    'brand_project_id',
    'colour_browser_background',
    'colour_background',
    'colour_border',
    'colour_whiteboard_background',
    'colour_whiteboard_border',
    'colour_whiteboard_icon_background',
    'colour_whiteboard_icon_border',
    'colour_menu_background',
    'colour_menu_border',
    'colour_icon',
    'colour_text',
    'colour_label',
    'colour_button_background',
    'colour_button_border'
  ]
};

const VIEW_ATTRIBUTES = [
  'colour_browser_background',
  'colour_background',
  'colour_border',
  'colour_whiteboard_background',
  'colour_whiteboard_border',
  'colour_whiteboard_icon_background',
  'colour_whiteboard_icon_border',
  'colour_menu_background',
  'colour_menu_border',
  'colour_icon',
  'colour_text',
  'colour_label',
  'colour_button_background',
  'colour_button_border'
];

// Exports
// Untested
function findScheme(params, account) {
  let deferred = q.defer();

  Session.find({
    include: [{
      model: Account,
      where: { id: account.id }
    }, {
      model: BrandProjectPreference,
      where: { id: params.id }
    }]
  }).then(function(sessions) {
    if(sessions) {
      let schemes = filterSchemesFromSessions(sessions);
      deferred.resolve(simpleParams(schemes));
    }
    else {
      deferred.reject(MESSAGES.notFound);
    }
  }).catch(Session.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

// Partly tested
function findAllSchemes(account) {
  let deferred = q.defer();

  Session.findAll({
    include: [{
      model: Account,
      where: { id: account.id }
    }, BrandProjectPreference]
  }).then(function(sessions) {
    let schemes = filterSchemesFromSessions(sessions);
    deferred.resolve(simpleParams(schemes));
  }).catch(Session.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

// Broken and untested
function createScheme(params, account) {
  let deferred = q.defer();
  let validParams = validateParams(params, VALID_ATTRIBUTES.manage);
  delete validParams.id;

  BrandProjectPreference.create(validParams).then(function(result) {
    deferred.resolve(simpleParams(result, MESSAGES.created));
  }).catch(BrandProjectPreference.sequelize.ValidationError, function(error) {
    deferred.reject(prepareErrors(error));
  }).catch(function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

// Untested
function removeScheme(params, account) {
  let deferred = q.defer();

  findScheme(params, account).then(function(schemes) {
    schemes.data[0].destroy().then(function(result) {
      deferred.resolve(simpleParams(null, MESSAGES.removed));
    }).catch(Session.sequelize.ValidationError, function(error) {
      deferred.reject(prepareErrors(error));
    }).catch(function(error) {
      deferred.reject(error);
    });
  }, function(error) {
    deferred.reject(error);
  });

  return deferred.promise;
};

// Untested
function copyScheme(params, account) {
  let deferred = q.defer();

  findScheme(params, account).then(function(schemes) {
    createScheme(schemes.data[0], account).then(function(result) {
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
  let array = [];

  _.map(VIEW_ATTRIBUTES, function(attr) {
    array.push({
      title: _.startCase(attr.substring('colour_'.length)),
      model: attr
    });
  });

  return array;
}

// Helpers
function validateParams(params, attributes) {
  if(_.isObject(params.SurveyQuestions)) {
    let array = [];
    _.map(params.SurveyQuestions, function(n) {
      array.push(n);
    });
    params.SurveyQuestions = array;
  }

  params.SurveyQuestions = _.remove(params.SurveyQuestions, function(n) {
    return _.isObject(n);
  });

  return _.pick(params, attributes);
};

function filterSchemesFromSessions(sessions) {
  let array = [];
  _.map(sessions, function(session) {
    array = _.concat(array, session.BrandProjectPreferences);
  });

  return _.uniqBy(array, 'id');
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
  findAllSchemes: findAllSchemes,
  removeScheme: removeScheme,
  copyScheme: copyScheme
};
