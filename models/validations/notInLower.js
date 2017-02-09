'use strict';

function notInLower(restrictedStrings, message) {
  return function(value, next) {
    let isIn = restrictedStrings.indexOf(value.toLowerCase()) !== -1;

    if(isIn) {
      next(message);
    }
    else {
      next();
    }
  }
};

module.exports = {
  notInLower: notInLower
};
