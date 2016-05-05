'use strict';
var _ = require('lodash');

function length(fieldName, values) {
  return function(value, next) {
    if(value && typeof value == 'string') {
      let min = values.min;
      if(min && value.length < min) {
        return next(`${_.startCase(fieldName)} must be longer than ${min} characters`);
      }

      let max = values.max;
      if(max && value.length > max) {
        return next(`${_.startCase(fieldName)} must not be longer than ${max} characters`);
      }
    }

    next();
  }
};

module.exports = {
  length: length
};
