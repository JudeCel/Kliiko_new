'use strict';
var Account  = require('./../../models').Account;
var User  = require('./../../models').User;
var AccountUser  = require('./../../models').AccountUser;

function findAllAccounts(callback) {
  // Account.findAll({order: 'name ASC', include: [{model: User, include:[AccountUser], where: {accountId: this.id}}]})

  Account.findAll({order: 'name ASC', include: [User, AccountUser]})
  .then(function (result) {
    callback(result);
  });
}

function editComment(userId, comment, callback){
  User.update({
    comment: comment
  }, {
    where: {id: userId}
  })
  .then(function (result) {
    return callback(null, result);
  })
  .catch(function (err) {
    callback(err);
  });
};

function reactivateOrDeactivate(userId, AccountId, callback){
  AccountUser.find({where: {userId: userId, AccountId: AccountId}}).done(function (result) {
    if (result) { 
      if (result.active === true) {
        result.update({
          active: false
        })
        .then(function (result) {
          return callback(null, result);
        })
        .catch(function (err) {
          callback(err);
        });
      }else{
        result.update({
          active: true
        })
        .then(function (result) {
          return callback(null, result);
        })
        .catch(function (err) {
          callback(err);
        });
      };
    } else {
      callback("Something went wrong."); //TODO: add more user friendlt message!
    };
  });
};

function simpleParams(error, message) {
  if(typeof error == 'string') {
    error = { message: error };
  }

  return { title: 'Account Database', error: error, message: message, accounts: {} };
}


module.exports = {
  findAllAccounts: findAllAccounts,
  simpleParams: simpleParams,
  editComment: editComment,
  reactivateOrDeactivate: reactivateOrDeactivate
}
