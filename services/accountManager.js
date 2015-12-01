'use strict';

var AccountUser = require('./../models').AccountUser;

function findUserManagers(user, callback) {
  AccountUser.findAll({ include: [ { model: Account } ], where: { userId: user.id } }).done(function(result) {
    if(result) {
      callback(null, result);
    }
    else {
      callback(true);
    };
  });
}

module.exports = {
  findUserManagers: findUserManagers
}
