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
    Invite.find({ include: [ { model: AccountUser, attributes: constants.safeAccountUserParams }, Account, User ], where: { token: token } }).then(function(invite) {
      sendInvite(invite, callback);
    });
  }).catch(function(error) {
    if(error.name == 'SequelizeUniqueConstraintError') {
      callback({ email: 'User has already been invited' });
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
    Invite.destroy({ where: { accountUserId: invite.accountUserId, accountId: invite.accountId } }).then(function(res) {
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
    setAccountUserActive(invite.accountUserId, function(err, result) {
      if (err) {
        return callback(err, null, null);
      }
      inviteDestroy(invite, function(error, message) {
        callback(error, null, message);
      });
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

    updateUser({ password: params.password }, invite, function(error, user) {
      if(error) {
        callback(error, invite);
      }
      else {
        inviteDestroy(invite, function(error, message) {
          callback(error, null, message);
        });
      };
    });
  });
};
function setAccountUserActive(accountUserId, callback) {
  AccountUser.update({status: "active"}, { where:{ id: accountUserId } }).then(function(result) {
    callback(null, result);
  },function(err) {
    callback(prepareErrors(error));
  })
}

function updateUser(params, invite, callback) {
  setAccountUserActive(invite.accountUserId, function(res, _) {
    User.update(params, { where: { id: invite.userId } }).then(function(result) {
      callback(null, true);
    }).catch(function(error) {
      callback(prepareErrors(error));
    });
  })
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

function inviteDestroy(invite, callback) {
 invite.destroy().then(function() {
   callback(null, 'You have successfully accepted Invite. Please login using your invite e-mail and password.');
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
