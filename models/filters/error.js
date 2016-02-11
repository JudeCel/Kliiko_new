'use strict';
var _ = require('lodash');

function filterErrors(errorsObject) {
  let object = {};

  _.map(errorsObject.errors, function(error) {
    let message = error.message.replace(error.path, '');
    let field = _.startCase(error.path);

    switch(message) {
      case " cannot be null":
      case "can't be empty":
      case "Validation notEmpty failed":
        message = `${field} can't be empty`;
        break;
      case ' already taken':
        message = `${field} already taken, should be unique`;
        break;
    }

    object[error.path] = message;
  });

  return object;
};

module.exports = {
  errors: filterErrors
};
