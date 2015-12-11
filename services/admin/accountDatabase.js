'use strict';
var mailers = require('../../mailers');
var Account  = require('./../../models').Account;
var User  = require('./../../models').User;
var AccountUser  = require('./../../models').AccountUser;

function findAllAccounts(callback) {
  Account.findAll({order: 'name ASC', include: [User, AccountUser]})
  .then(function (result) {
    callback(result);
  });
}

function editComment(userId, comment, callback){
  User.find({where: {id: userId}}).done(function (result) {
    if (result) {
      result.update({
        comment: comment
      })
      .then(function (result) {
        return callback(null, result);
      })
      .catch(function (err) {
        callback(err);
      });
    } else {
      callback("Something went wrong."); //MAYBE: add more user friendli message if account user is not found!
    };
  });
};

function reactivateOrDeactivate(userId, AccountId, callback){
  AccountUser.find({where: {UserId: userId, AccountId: AccountId}, include: [User, Account]}).done(function (result) {
    if (result) { 
      result.update({
        active: !result.active
      })
      .then(function (result) {
        mailers.users.sendReactivateOrDeactivate(result);
        return callback(null, result);
      })
      .catch(function (err) {
        callback(err);
      });
    } else {
      callback("Something went wrong."); //MAYBE: add more user friendli message if account user is not found!
    };
  });
};

function simpleParams(error, message) {
  if(typeof error == 'string') {
    error = { message: error };
  }
  return { title: 'Account Database', error: error, message: message, accounts: {} };
}

function getCsvJson(callback) {
  let data = [];  // new array
  let account = null;
  let user = null;
  let i, ii; // local variable for loops below.

  Account.findAll({order: 'name ASC', include: [User] })
  .then(function (result) {
    for(i = 0 ; i < result.length ; i++) {
      account = result[i];
      for(ii = 0 ; ii < account.Users.length ; ii++) {
        user = account.Users[ii];
        data.push({
          "Account Name": account.name,
          "Account Manager": user.firstName + " " + user.lastName,
          "Date of Sign-up": user.createdAt,
          "E-mail": user.email,
          "Postal Address": "",
          "City": "",
          "State": "",
          "Postcode": "",
          "Country": "",
          "Mobile": "",
          "# Sessions purchased": "",
          "Tips permission": "",
          "# Active Sessions": "",
          "Comment": user.comment
        });  // add a new object
      }
    }

    callback(null, data);
  });
};

module.exports = {
  findAllAccounts: findAllAccounts,
  simpleParams: simpleParams,
  editComment: editComment,
  reactivateOrDeactivate: reactivateOrDeactivate,
  getCsvJson: getCsvJson
}
