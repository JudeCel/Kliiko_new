'use strict';

var _ = require('lodash');
var sanitizeHtml = require('sanitize-html');
var MessagesUtil = require('./../../util/messages');

function length(fieldName, values) {
  return function(value, next) {
    if(value && typeof value == 'string') {
      let min = values.min;
      if(min && sanitizeHtml(value, { allowedTags: [] }).length < min) {
        let message = MessagesUtil.models.validations.length.min.replace('XXX', min);
        return next(_.startCase(fieldName) + message);
      }

      let max = values.max;
      if(max && sanitizeHtml(value, { allowedTags: [] }).length > max) {
        let message = MessagesUtil.models.validations.length.max.replace('XXX', max);
        return next(_.startCase(fieldName) + message);
      }
    }

    next();
  }
};

module.exports = {
  length: length
};
