'use strict';
var _ = require('lodash');

function filterErrors(errorsObject) {
  let object = {};

  _.map(errorsObject.errors, function(error) {
    let message = error.message;
    let field = _.startCase(error.path);

    switch(true) {
      case message.includes(" cannot be null"):
      case message.includes("can't be empty"): // promotionCode
      case message.includes("Validation notEmpty failed"):
        message = `${field} can't be empty`;
        break;
      case message.includes('Validation is failed'):
        message = `${field} has invalid format`;
        break;
      case message.includes(' must be unique'):
        message = `${field} has already been taken`;
        break;
    }

    object[error.path] = message;
  });

  return object;
};

module.exports = {
  errors: filterErrors
};
