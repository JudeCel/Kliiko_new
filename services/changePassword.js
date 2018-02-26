'use strict';

var MessagesUtil = require('./../util/messages');
var usersService  = require('./users');
var mailers = require('../mailers');

function save(req, callback){
  let errors = {message: ""};

  if ( !req.body.password || !req.body.repassword ) {
    errors.message = MessagesUtil.changePassword.fillBoth;
  }

  if ( req.body.password !== req.body.repassword ) {
    errors.message = MessagesUtil.changePassword.notEqual;
  }

  if (errors.message !== "") {
    return callback(errors);
  }

  let userId = req.currentResources.user.id;
  let newPassword = req.body.password;
  let message = "";
  let params = {email: req.currentResources.user.email, name: req.currentResources.accountUser.firstName};

  usersService.changePassword(userId, newPassword, function(err, data){
    if (err) {
      return callback(err);
    }
    mailers.users.sendPasswordChangedSuccess(params, () => { });
    callback(null, MessagesUtil.changePassword.success, req.currentResources.user);
  });
}

module.exports = {
  save: save,
  successMessage: MessagesUtil.changePassword.success
}
