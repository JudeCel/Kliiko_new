'use strict';

function validateError(error, resolve, reject) {
  console.log(error);
  switch(true) {
    case error.message.includes('does not exist'):
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
