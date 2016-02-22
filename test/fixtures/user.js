'use strict';

var models = require('./../../models');
var usersServices  = require('./../../services/users');
var q = require('q');

function createUserAndOwnerAccount(params) {
  let deferred = q.defer();

  let attrs = {
    accountName: 'BLauris',
    firstName: 'Lauris',
    lastName: 'Blīgzna',
    password: 'multipassword',
    email: 'bligzna.lauris@gmail.com',
    gender: 'male'
  }

  models.sequelize.sync({ force: true }).then(() => {
    usersServices.create(params || attrs, function(error, user) {
      if(error) {
        deferred.reject(error);
      }
      else {
        user.getOwnerAccount().then(function(accounts) {
          models.AccountUser.find({
            where: {
              UserId: user.id,
              AccountId: accounts[0].id
            }
          }).then(function(accountUser) {
            deferred.resolve({ user: user, account: accounts[0], accountUser: accountUser });
          }).catch(function(error) {
            deferred.reject(error);
          })
        });
      }
    });
  });

  return deferred.promise;
}

module.exports = {
  createUserAndOwnerAccount: createUserAndOwnerAccount
};
