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
    userId: params.userId,
    accountId: params.accountId,
    token: token,
    sentAt: new Date(),
    expireAt: expireDate,
    role: params.role,
    userType: params.userType
  }).then(function(result) {
    Invite.find({ include: [ { model: User, attributes: constants.safeUserParams }, Account ], where: { token: token } }).then(function(invite) {
      let inviteParams = { token: invite.token, email: invite.User.email };
      inviteMailer.sendInviteAccountManager(inviteParams, function(error, data) {
        callback(error, invite, data);
      });
    });
  }).catch(function(error) {
    if(error.name == 'SequelizeUniqueConstraintError') {
      callback({ email: 'User has already been invited' })
    }
    else {
      callback(prepareErrors(error));
    }
  });
};

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
    Invite.destroy({ where: { userId: invite.userId, accountId: invite.accountId } }).then(function() {
      callback(null, true);
    }).catch(function(error) {
      callback(prepareErrors(error));
    });
  }
};

function findInvite(token, callback) {
  Invite.find({ include: [ User, Account ], where: { token: token } }).then(function(result) {
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

    createAccountUserFromInvite(invite, function(error, message) {
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

    createAccountAndUser(invite, params, function(error) {
      if(error) {
        callback(error, invite);
      }
      else {
        createAccountUserFromInvite(invite, function(error, message) {
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
      User.find({ where: { id: invite.userId } }).then(function(user) {
        if(user) {
          cb(null, user);
        }
        else {
          cb('Not found user');
        }
      }).catch(function(error) {
        cb(prepareErrors(error));
      });
    },
    function(user, cb) {
      Account.destroy({ where: { id: invite.accountId } }).then(function() {
        cb(null, user);
      }).catch(function(error) {
        cb(prepareErrors(error));
      });
    },
    function(user, cb) {
      AccountUser.destroy({ where: { UserId: user.id, AccountId: invite.accountId } }).then(function() {
        cb(null, user);
      }).catch(function(error) {
        cb(prepareErrors(error));
      });
    },
    function(user, cb) {
      user.destroy().then(function() {
        cb(null, true);
      }).catch(function(error) {
        cb(prepareErrors(error));
      });
    }
  ], function(error, result) {
    callback(error);
  });
}

function createAccountUserFromInvite(invite, callback) {
  invite.User.addAccount(invite.Account, { role: invite.role, owner: false }).then(function(result) {
    if(result) {
      invite.destroy().then(function() {
        callback(null, 'You have successfully accepted Invite. Please login using your invite e-mail and password.');
      });
    }
    else {
      callback("Can't add account");
    }
  });
};

function createAccountAndUser(invite, params, callback) {
  updateUser({ password: params.password }, invite, function(error) {
    callback(error);
  });
};

function updateUser(params, invite, callback) {
  User.update(params, { where: { id: invite.userId } }).then(function(result) {
    callback(null, true);
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
