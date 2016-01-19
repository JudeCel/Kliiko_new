'use strict';
var models = require('./../models');
var AccountUser = models.AccountUser;

function create(params, account, user, t, callback) {
    AccountUser.create({AccountId: account.id, UserId: user.id, role: 'accountManager', owner: true },
      { transaction: t }
    ).then(function(result) {
       callback(null, user, params, t);
    }).catch(AccountUser.sequelize.ValidationError, function(err) {
      console.log(err);
       callback(err, null, null, t);
    }).catch(function(err) {
      console.log(err);
       callback(err, null, null, t);
    });
}

module.exports = {
  create: create
}
