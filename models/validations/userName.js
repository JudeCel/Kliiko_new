'use strict';

var _ = require('lodash');
var constants = require('./../../util/constants');
var MessagesUtil = require('./../../util/messages');

function userName(fieldName) {
  return function(value, next) {
    if (value instanceof String) {
      value = value.replace(/\s\s+/g, '');
    }

    if(!constants.validNameRegExp.test(value) || value.length < 2) {
      let message = MessagesUtil.models.validations.firstLastName.replace('XXX', _.startCase(fieldName));
      next(message);
    }
    else {
      next();
    }
  }
};

module.exports = {
  userName: userName
};
