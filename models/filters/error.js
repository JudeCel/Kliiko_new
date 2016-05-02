'use strict';
var _ = require('lodash');

function filterErrors(errorsObject) {
  let object = {};

  if(errorsObject.errors) {
    _.map(errorsObject.errors, function(error) {
      parseErrorMessage(error, object);
    });
  }
  else {
    parseErrorMessage(errorsObject, object);
  }

  return object;
};

function parseErrorMessage(error, object) {
  let message = error.message;
  let path = error.path || (error.parent && error.parent.column) || 'unhandled';
  let field = _.startCase(path);

  switch(true) {
    case message.includes('lower(name::text)'):
      path = 'name';
      message = `Name has already been taken`;
      break;
    case message.includes("null value in column"):
    case message.includes(" cannot be null"):
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

  object[path] = message;
}

module.exports = {
  errors: filterErrors
};
