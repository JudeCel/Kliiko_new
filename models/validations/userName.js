'use strict';
var _ = require('lodash');
var constants = require('../../util/constants');

function userName(fieldName) {
  return function(value, next) {
    if (value instanceof String) {
      value = value.replace(/\s\s+/g, '');
    }

    if (!constants.validNameRegExp.test(value) || value.length < 2) {
      return next(`Invalid ${_.startCase(fieldName)} format`);
    }

    next();
  }
};

module.exports = {
  userName: userName
};
