"use strict";
var models = require('./../models');
var User = models.User;
var filters = require('./../models/filters');
var _ = require('lodash');
var accountService = require('./account');
var accountUserService = require('./accountUser');
var socialProfileService = require('./socialProfile');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var async = require('async');

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
  update: update
};


function create(params, callback) {
  let err = {};

  if (params.termsAndConditions === "false") {
    err.termsAndConditions = "You must agree to the terms and conditions before register."
    return callback(err);
  }

  createUser(params, function (error, result) {
    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
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
        callback(null, object.user);
      });
    }
    else {
      object.transaction.rollback().then(function() {
        callback(object.errors, object.user);
      });
    }
  });
}

function comparePassword(email, password, callback) {
  User.find({where: {email: email}}).done(function (result) {
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

function setEmailConfirmationToken(email, callback) {

  let token = uuid.v1();

  User.update({
    confirmationToken: token,
    confirmationSentAt: new Date()
  }, {
    where: {email: email}
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
    tipsAndUpdate: 'on',
    termsAndConditions: 'false',
    errors: (errors || {}),
    socialProfile: null
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
      return callback({message: "Password already changed."});
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

  User.update({
    resetPasswordToken: token,
    resetPasswordSentAt: new Date()
  }, {
    where: {email: email}
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
