'use strict';

var models = require('./../models');
var AccountUser = models.AccountUser;

function create(account, user, callback) {
    user.addAccount(account, { role: 'accountManager', owner: true }).then(function(result) {
      return callback(null, user);
    }).catch(AccountUser.sequelize.ValidationError, function(err) {
      return callback(err);
    }).catch(function(err) {
      return callback(err);
    });
}

module.exports = {
  create: create
}
