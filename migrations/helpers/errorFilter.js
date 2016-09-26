'use strict';

function validateError(error, resolve, reject) {
  switch(true) {
    case error.message.includes('already exists'):
      resolve();
      break;
    default:
      reject(error);
  }
}
module.exports = {
  validateError: validateError
}
