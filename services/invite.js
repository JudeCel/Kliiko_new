'use strict';

var models = require('./../models');
var Invite = models.Invite;
var User = models.User;
var Account = models.Account;
var AccountUser = models.AccountUser;

var inviteMailer = require('../mailers/invite');
var constants = require('../util/constants');

var uuid = require('node-uuid');
var async = require('async');
var _ = require('lodash');

const EXPIRE_AFTER_DAYS = 5;

function createInvite(params, callback) {
  let token = uuid.v1();
  let expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + EXPIRE_AFTER_DAYS);

  Invite.create({
    accountUserId: params.accountUserId,
    userId: params.userId,
    accountId: params.accountId,
    token: token,
    sentAt: new Date(),
    expireAt: expireDate,
    role: params.role,
    userType: params.userType
  }).then(function(result) {
    Invite.find({ include: [ { model: AccountUser, attributes: constants.safeAccountUserParams }, Account ], where: { token: token } }).then(function(invite) {
      sendInvite(invite, callback);
    });
  }).catch(function(error) {
    console.log(error);
    if(error.name == 'SequelizeUniqueConstraintError') {
      callback({ email: 'User has already been invited' })
    }
    else {
      callback(prepareErrors(error));
    }
  });
};

function sendInvite(invite, callback) {
  let inviteParams = {
    token: invite.token,
    email: invite.AccountUser.email,
    firstName: invite.AccountUser.firstName,
    lastName: invite.AccountUser.lastName,
    accountName: invite.Account.name
  };

  inviteMailer.sendInviteAccountManager(inviteParams, function(error, data) {
    callback(error, invite, data);
  });
}

function findAndRemoveInvite(params, callback) {
  Invite.find({ where: params }).then(function(invite) {
    if(invite) {
      removeInvite(invite, function(err) {
        callback(err, 'Successfully removed Invite');
      });
    }
    else {
      callback('Invite not found');
    }
  });
}

function removeInvite(invite, callback) {
  if(invite.userType == 'new') {
    removeAllAssociatedDataOnNewUser(invite, function(error) {
      callback(error);
    });
  }
  else {
    Invite.destroy({ where: { userId: invite.accountUserId, accountId: invite.accountId } }).then(function() {
      callback(null, true);
    }).catch(function(error) {
      callback(prepareErrors(error));
    });
  }
};

function findInvite(token, callback) {
  Invite.find({ include: [Account, AccountUser, User], where: { token: token } }).then(function(result) {
    if(result) {
      callback(null, result);
    }
    else {
      callback('Invite not found');
    }
  });
};

function declineInvite(token, callback) {
  findInvite(token, function(error, invite) {
    if(error) {
      callback(error);
    }
    else {
      removeInvite(invite, function(error) {
        callback(error, invite, 'Successfully declined invite');
      });
    }
  })
};

function acceptInviteExisting(token, callback) {
  findInvite(token, function(error, invite) {
    if(error) {
      return callback(error);
    }
    else if(invite.userType == 'new') {
      return callback(null, invite);
    }

    createUserFromInvite(invite, function(error, message) {
      callback(error, invite, message);
    });
  });
};

function acceptInviteNew(token, params, callback) {
  findInvite(token, function(error, invite) {
    if(error) {
      return callback(error);
    }
    else if(invite.userType == 'existing') {
      return callback(true);
    }

    createUser({ password: params.password }, invite, function(error, user) {
      if(error) {
        callback(error, invite);
      }
      else {
        createUserFromInvite(invite, user, function(error, message) {
          callback(error, invite, message);
        });
      }
    });
  });
};

//Helpers
function removeAllAssociatedDataOnNewUser(invite, callback) {
  async.waterfall([
    function(cb) {
      AccountUser.find({ where: { id: invite.accountUserId } }).then(function(accountUser) {
        if(accountUser) {
          cb(null, accountUser);
        }
        else {
          cb('Not found user');
        }
      }).catch(function(error) {
        cb(prepareErrors(error));
      });
    },
    function(accountUser, cb) {
      accountUser.destroy().then(function() {
        cb(null, true);
      }).catch(function(error) {
        cb(prepareErrors(error));
      });
    }
  ], function(error, result) {
    callback(error);
  });
}

function createUserFromInvite(invite, user, callback) {
  // console.log(user);

 user.addAccountUser(invite.AccountUser).then(function(result) {
   if(result) {
     invite.destroy().then(function() {
       callback(null, 'You have successfully accepted Invite. Please login using your invite e-mail and password.');
     });
   }
   else {
     callback("Can't add account");
   }
 }, function(err) {
   console.log(err);
 });
};

function createUser(params, invite, callback) {
  params.email = invite.AccountUser.email;
  params.confirmedAt = new Date();

  User.create(params).then(function(result) {
    callback(null, result);
  }).catch(function(error) {
    callback(prepareErrors(error));
  });
};

function prepareErrors(err) {
  let errors = ({});
  _.map(err.errors, function (n) {
    errors[n.path] = _.startCase(n.path) + ':' + n.message.replace(n.path, '');
  });
  return errors;
};

module.exports = {
  createInvite: createInvite,
  findAndRemoveInvite: findAndRemoveInvite,
  removeInvite: removeInvite,
  findInvite: findInvite,
  acceptInviteExisting: acceptInviteExisting,
  acceptInviteNew: acceptInviteNew,
  declineInvite: declineInvite
};
