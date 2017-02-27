"use strict";

var MessagesUtil = require('./../util/messages');
var models = require('./../models');
var User = models.User;
var AccountUser = models.AccountUser ;
var filters = require('./../models/filters');
var _ = require('lodash');
var accountService = require('./account');
var accountUserService = require('./accountUser');
var socialProfileService = require('./socialProfile');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var async = require('async');
var constants = require('./../util/constants');

module.exports = {
  create: create,
  user: User,
  createUser: createUser,
  comparePassword: comparePassword,
  prepareParams: prepareParams,
  resetPassword: resetPassword,
  setResetToken: setResetToken,
  getUserByToken: getUserByToken,
  changePassword: changePassword,
  update: update,
  inviteInProcessExists: inviteInProcessExists
};


function create(params, callback) {
  let err = {};

  if (params.termsAndConditions === "false") {
    err.termsAndConditions = MessagesUtil.users.agreeTOC;
    return callback(err);
  }

  accountUserService.findWithEmail(params.email).then(function (result) {
    let canCreate = true;
    let errorWithDialog = {};

    //update error with diaolg to show if email exists in system
    for(let i1=0; i1<result.length; i1++) {
      if (result[i1].UserId != null) {
        canCreate = false;
        errorWithDialog.dialog = {link: null, message: MessagesUtil.users.dialog.emailExistsCanCreateAccount}
        if (result[i1].role == 'accountManager') {
          errorWithDialog.dialog = {link: null, message: MessagesUtil.users.dialog.emailExists}
          break;
        }
      } else {
        for(let i2=0; i2<result[i1].Invites.length; i2++) {
          if (result[i1].Invites[i2].status == constants.inviteStatuses[constants.inviteStatuses.length-1]) {
            canCreate = false;
            errorWithDialog.dialog = {link: { url: '/invite/' + result[i1].Invites[i2].token + '/accept/', title: "Continue to Check In" }, message: MessagesUtil.users.dialog.emailExistsCanCreateAccount}
          }
        }
      }
    }

    if (canCreate) {
      createUser(params, function (error, result) {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    }
    else {
      return callback(errorWithDialog);
    }

  }, function(error) {
    return callback(error);
  });
};

function update(req, callback){
  User.update(req.body, {
    where: {id: req.user.id}
  })
  .then(function (result) {
    return callback(null, result);
  })
  .catch(function (err) {
    callback(err);
  });
}

function createUser(params, callback) {

  parsePhoneParams(params);

  let transactionPool = models.sequelize.transactionPool;
  let tiket = transactionPool.getTiket();
  transactionPool.once(tiket, () => {
    let createNewUserFunctionList = [
      function (cb) {
        models.sequelize.transaction().then(function(t) {
          User.create(params, { transaction: t } ).then(function (result) {
            cb(null, { params: params, user: result, transaction: t, errors: {} });
          }, function(error) {
            cb(null, { params: params, user: {}, transaction: t, errors: filters.errors(error) })
          });
        });
      },
      accountService.create,
      accountUserService.createAccountManager,
    ]

    if (params.socialProfile) {
      createNewUserFunctionList.push(socialProfileService.create);
    }
    async.waterfall(createNewUserFunctionList, function(_error, object) {

      if(_.isEmpty(object.errors)) {
        object.transaction.commit().then(function() {
         transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
          callback(null, object.user);
        });
      }
      else {
        object.transaction.rollback().then(function() {
         transactionPool.emit(transactionPool.CONSTANTS.endTransaction, tiket);
          callback(object.errors, object.user);
        });
      }
    })
  });
  
  transactionPool.once(transactionPool.timeoutEvent(tiket), () => {
    callback("Server Timeoute");
  });

  transactionPool.emit(transactionPool.CONSTANTS.nextTick);
}

function parsePhoneParams(params) {
  try {
    params.phoneCountryData = JSON.parse(params.phoneCountryData);

    if(params.mobile.length > 0 && !params.mobile.includes("+" + params.phoneCountryData.dialCode)){
      params.mobile = "+" + params.phoneCountryData.dialCode + params.mobile;
    }

    params.landlineNumberCountryData = JSON.parse(params.landlineNumberCountryData);

    if(params.landlineNumber.length > 0 && !params.landlineNumber.includes("+" + params.landlineNumberCountryData.dialCode)){
      params.landlineNumber = "+" + params.landlineNumberCountryData.dialCode + params.landlineNumber;
    }
  }  catch (exception) {
    params.mobile = "";
    params.landlineNumber = "";
    params.phoneCountryData = {name: "Australia", iso2: "au", dialCode: "61"};
    params.landlineNumberCountryData = {name: "Australia", iso2: "au", dialCode: "61"};
  }
}

function comparePassword(email, password, callback) {
  User.find({ where: { email: { ilike: email } } }).done(function (result) {
    if (result) {
        bcrypt.compare(password, result.encryptedPassword, function (err, res) {
            if (err) {
                return callback(true, null)
            }
            if (res == true) {
                callback(null, result);
            } else {
                callback(true, null);
            }
        });
    } else {
      callback(true, null);
    };
  });
};

function inviteInProcessExists(email, callback) {
  accountUserService.findWithEmail(email).then(function (result) {
    for(let i1=0; i1<result.length; i1++) {
      if (!result[i1].UserId) {
        for(let i2=0; i2<result[i1].Invites.length; i2++) {
          if (result[i1].Invites[i2].status == constants.inviteStatuses[constants.inviteStatuses.length-1]) {
            return callback(true, result[i1].Invites[i2].token);
          }
        }
      }
    }
    callback(false, null);
  }, function(error) {
    callback(false, null);
  });
}

function setEmailConfirmationToken(email, callback) {

  let token = uuid.v1();

  User.update({
    confirmationToken: token,
    confirmationSentAt: new Date()
  }, {
    where: {email: { ilike: email }}
  })
  .then(function (result) {
    if (result[0] > 0) {
      return callback(null, token);
    } else {
      callback(null, null);
    }
  })
  .catch(function (err) {
    callback(true, null);
  });

}

function prepareParams(req, errors) {
  return _.assign({
    user: req.user,
    title: 'Registration',
    accountName: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    landlineNumber: '',
    gender: '',
    phoneCountryData: {},
    landlineNumberCountryData: {},
    tipsAndUpdate: 'on',
    termsAndConditions: 'false',
    errors: (errors || {}),
    socialProfile: null,
    selectedPlanOnRegistration: null
  }, req.body);
}

function changePassword(id, password, callback) {
  User.update({
    password: password
  }, {
    where: {id: id}
  })
  .then(function (result) {
    return callback(null, result);
  })
  .catch(function (err) {
    callback(err);
  });
}

function getUserByToken(token, callback) {
  User.find({
    where: {
      resetPasswordToken: token
    },
    attributes: ['id', 'resetPasswordSentAt', 'email', 'resetPasswordToken']
  })
  .then(function (result) {
    if (result) {
      return callback(null, result);
    } else {
      return callback({message: MessagesUtil.users.alreadyChanged});
    }
  })
  .catch(function (err) {
    callback(err);
  });
}

function resetPassword(token, password, callback) {
  User.update({
    resetPasswordToken: null,
    resetPasswordSentAt: null,
    password: password
  }, {
    where: {resetPasswordToken: token}
  })
  .then(function (result) {
    return callback(null, result);
  })
  .catch(function (err) {
    callback(err);
  });
}

function setResetToken(email, callback) {

  var token = uuid.v1();
  User.find({
    where: {email: { ilike: email }},
    include: {model: AccountUser, attributes: ['firstName']}
  }).done(function (foundUser) {
    if (!foundUser) {
      callback(null, null, null);
      return;
    }
    User.update({
      resetPasswordToken: token,
      resetPasswordSentAt: new Date()
    }, {
      where: {email: { ilike: email }}
    })
    .then(function (result) {
      if (result[0] > 0) {
        return callback(null, token, foundUser.AccountUsers[0].firstName);
      } else {
        callback(null, null, null);
      }
    })
    .catch(function (err) {
      callback(true, null, null);
    });
  });
}
