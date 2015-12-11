'use strict';

var models = require('./../models');
var Invite = models.Invite;
var User = models.User;
var Account = models.Account;
var AccountUser = models.AccountUser;
var inviteMailer = require('../mailers/invite');
var uuid = require('node-uuid');
var async = require('async');

const EXPIRE_AFTER_DAYS = 5;

function createInvite(params, sendEmail, callback) {
  let token = uuid.v1();
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + EXPIRE_AFTER_DAYS);

  Invite.create({
    userId: params.userId,
    accountId: params.accountId,
    token: token,
    sentAt: new Date(),
    expireAt: expireDate,
    role: params.role,
    userType: params.userType
  }).then(function(result) {
    Invite.find({ include: [ User, Account ], where: { token: token } }).then(function(invite) {
      if(sendEmail) {
        sendEmailToUser(invite, function(err) {
          callback(err, invite);
        });
      }
      else {
        callback(null, invite);
      }
    });
  }).catch(function(error) {
    callback(error);
  });
}

function removeInvite(invite, callback) {
  if(invite.userType == 'new') {
    User.find({ where: { id: invite.userId } }).then(function(user) {
      user.getOwnerAccount({ include: [ AccountUser ] }).then(function(accounts) {
        accounts[0].AccountUser.destroy().then(function() {
          accounts[0].destroy().then(function() {
            user.destroy().then(function() {
              callback(null);
            });
          });
        }).catch(function(err) {
          callback(err);
        });
      }).catch(function(err) {
        callback(err);
      });
    });
  }
  else {
    Invite.destroy({ where: { userId: invite.userId, accountId: invite.accountId } }).then(function() {
      callback(null);
    }).catch(function(err) {
      callback(err);
    });
  }
}

function findInvite(token, callback) {
  Invite.find({ include: [ User, Account ], where: { token: token } }).then(function(result) {
    if(result) {
      callback(null, result);
    }
    else {
      callback('Invite not found');
    }
  });
}

function declineInvite(invite, callback) {
  removeInvite(invite, function(err) {
    callback(err, 'Successfully declined invite');
  });
}

function acceptInviteExisting(invite, callback) {
  updateUser({ status: 'accepted' }, invite, function(error) {
    if(error) {
      callback(error);
    }
    else {
      createAccountUserFromInvite(invite, function(error, message) {
        callback(error, message);
      });
    }
  });
}

function acceptInviteNew(invite, params, callback) {
  createAccountAndUser(invite, params, function(error) {
    if(error) {
      callback(error);
    }
    else {
      createAccountUserFromInvite(invite, function(error, message) {
        callback(error, message);
      });
    }
  });
}

//Helpers
function createAccountUserFromInvite(invite, callback) {
  invite.User.addAccount(invite.Account, { role: invite.role, owner: false }).then(function(result) {
    if(result) {
      invite.destroy().then(function() {
        callback(null, 'Successfully accepted invite');
      });
    }
    else {
      callback("Can't add account");
    }
  });
}

function createAccountAndUser(invite, params, callback) {
  updateAccount(params.accountName, invite, function(error) {
    if(error) {
      callback(error);
    }
    else {
      updateUser({ password: params.password, status: 'accepted' }, invite, function(error) {
        callback(error);
      });
    }
  });
}

function updateUser(params, invite, callback) {
  User.update(params, { where: { id: invite.userId } }).then(function(result) {
    callback(null);
  }).catch(function(err) {
    callback(err);
  });
}

function updateAccount(accountName, invite, callback) {
  Account.find({
    include: [{
      model: AccountUser,
      where: { UserId: invite.userId, owner: true }
    }]
  }).then(function(account) {
    if(account) {
      account.update({ name: accountName }).then(function(result) {
        callback(null);
      });
    }
    else {
      callback('Account not found');
    }
  }).catch(function(error) {
    callback(error);
  });
}

function sendEmailToUser(invite, callback) {
  if(invite.userType == 'existing') {
    inviteMailer.sendInviteNewUserToAccount(invite, function(error) {
      if(error) {
        callback(error)
      }
      else {
        callback(null);
      }
    });
  }
  else {
    inviteMailer.sendInviteNewUserToAccount(invite, function(error) {
      if(error) {
        callback(error)
      }
      else {
        callback(null);
      }
    });
  }
}

module.exports = {
  createInvite: createInvite,
  removeInvite: removeInvite,
  findInvite: findInvite,
  acceptInviteExisting: acceptInviteExisting,
  acceptInviteNew: acceptInviteNew,
  declineInvite: declineInvite
}
