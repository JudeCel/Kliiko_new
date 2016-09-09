'use strict';
var constants = require('./../../util/constants');

module.exports = {
  phone: phone
};

function phone(number, message) {
  if(number && !constants.phoneRegExp.test(number)) {
    var newMessage = message.replace('XXX', constants.validPhoneFormat);
    throw new Error(newMessage);
  }
}
