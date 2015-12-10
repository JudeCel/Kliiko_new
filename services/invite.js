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
    Invite.find({ include: [ User, Account ], where: { token: token } }).done(function(invite) {
      if(sendEmail) {
        sendEmailToUser(invite, function(err) {
          if(err) {
            callback(err);
          }
          else {
            callback(null, invite);
          }
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
        accounts[0].AccountUser.destroy();
        accounts[0].destroy();
        user.destroy();
        callback(null);
      }).catch(function(err) {
        callback(err);
      })
    }).catch(function(err) {
      callback(err);
    });
  }
  else {
    Invite.destroy({ where: { userId: invite.userId, accountId: invite.accountId } }).done(function() {
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
      callback('Not found');
    }
  }).catch(function(error) {
    callback(error);
  });
}

function manageInvite(userChoice, invite, params, callback) {
  if(userChoice == 'accept') {
    acceptInvite(invite, params, function(error, message) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, message);
      }
    });
  }
  else if(userChoice == 'decline') {
    declineInvite(invite, function(error, message) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, message);
      }
    });
  }
}

function declineInvite(invite, callback) {
  removeInvite(invite, function(err) {
    if(err) {
      callback(err);
    }
    else {
      callback(null, 'Successfully declined invite');
    }
  });
}

function acceptInvite(invite, params, callback) {
  console.log(invite);
  if(invite.userType == 'new') {
    createAccountAndUser(invite, params, function(error) {
      if(error) {
        callback(error);
      }
      else {
        createAccountUserFromInvite(invite, function(error, message) {
          callback(null, message);
        });
      }
    });
  }
  else {
    updateUser({ status: 'accepted' }, invite, function(error) {
      if(error) {
        callback(error);
      }
      else {
        createAccountUserFromInvite(invite, function(error, message) {
          callback(null, message);
        });
      }
    });
  }
};

//Helpers
function createAccountUserFromInvite(invite, callback) {
  invite.User.addAccount(invite.Account, { role: invite.role, owner: false }).done(function(result) {
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

function updateUser(params, invite, callback) {
  User.update(params, { where: { id: invite.userId } }).then(function(result) {
    cb(null);
  }).catch(function(err) {
    cb(err);
  });
}

function updateAccount(accountName, invite, callback) {
  // Needs fix
  Account.update({ name: accountName }, {
    where: { owner: true },
    include: [{
      model: AccountUser,
      where: { UserId: invite.userId }
    }]
  }).done(function(result) {
    callback(null);
  }).catch(function(error) {
    callback(error);
  });
}

function createAccountAndUser(invite, params, callback) {
  updateAccount(params.accountName, function(error) {
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
  manageInvite: manageInvite,
  declineInvite: declineInvite,
  acceptInvite: acceptInvite
}
