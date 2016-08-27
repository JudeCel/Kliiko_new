'use strict';

var _ = require('lodash');
var MessagesUtil = require('./../../util/messages');

function length(fieldName, values) {
  return function(value, next) {
    if(value && typeof value == 'string') {
      let min = values.min;
      if(min && value.length < min) {
        let message = MessagesUtil.models.validations.length.min.replace('XXX', min);
        return next(_.startCase(fieldName) + message);
      }

      let max = values.max;
      if(max && value.length > max) {
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
