'use strict';

var models = require('./../models');
var Invite = models.Invite;
var User = models.User;
var Account = models.Account;
var AccountUser = models.AccountUser;
var uuid = require('node-uuid');
var async = require('async');

function createInvite(params, callback) {
  let token = uuid.v1();
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 5);

  Invite.create({
    UserId: params.userId,
    AccountId: params.accountId,
    token: token,
    sentAt: new Date(),
    expireAt: expireDate,
    role: params.role
  }).then(function(result) {
    Invite.find({ include: [ User, Account ], where: { token: token } }).done(function(result) {
      callback(null, result);
    });
  }).catch(function(error) {
    callback(error);
  });
}

function findInvite(token, callback) {
  Invite.find({ include: [ User, Account ], where: { token: token } }).then(function(result) {
    if(result) {
      callback(null, result);
    }
    else {
      callback('Not found');
    }
  }).catch(function(error) {
    callback(error);
  });
}

function declineInvite(invite, callback) {
  User.find({ where: { id: invite.UserId } }).then(function(user) {
    user.getOwnerAccount({ include: [ AccountUser ] }).then(function(accounts) {
      // accounts[0].AccountUser.destroy();
      accounts[0].destroy();
      user.destroy();
      callback(null, 'Successfully declined invite');
    }).catch(function(err) {
      callback(err);
    })
  }).catch(function(err) {
    callback(err);
  });
  // AccountUser.destroy({ include: [ User, Account ], where: { UserId: invite.UserId } }).done(function() {
  //   callback(null, 'Successfully declined invite');
  // }).catch(function(err) {
  //   callback(err);
  // });
}

function acceptInvite(invite, params, callback) {
  async.parallel([
    function(cb) {
      User.find({ where: { id: invite.UserId } }).then(function(result) {
        if(result) {
          result.getOwnerAccount().then(function(accounts) {
            accounts[0].update({ name: params.accountName }).done(function(result) {
              if(result) {
                cb(null, result);
              }
              else {
                cb('Account not found');
              }
            }).catch(function(err) {
              cb(err);
            });
          });
        }
        else {
          cb('User not found');
        }
      });
    },
    function(cb) {
      User.update({ password: params.password, status: 'accepted' }, { where: { id: invite.UserId } }).then(function(result) {
        if(result) {
          cb(null, result);
        }
        else {
          cb('User not found');
        }
      }).catch(function(err) {
        cb(err);
      });
    }
  ], function(err, result) {
    if(err) {
      callback(err);
    }
    else {
      invite.User.addAccount(invite.Account, { role: invite.role, owner: false }).done(function(result) {
        if(result) {
          invite.destroy().then(function() {
            callback(null, 'Successfully updated details');
          });
        }
        else {
          callback("Can't add account");
        }
      });
    }
  });
};

module.exports = {
  createInvite: createInvite,
  findInvite: findInvite,
  declineInvite: declineInvite,
  acceptInvite: acceptInvite
}
