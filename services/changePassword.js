"use strict";
var usersService  = require('./users');
var mailers = require('../mailers');
var successMessage = 'Password was changed successfully';

function save(req, callback){
  let errors = {message: ""};

  if ( !req.body.password || !req.body.repassword ) {
    errors.message = "Please fill both password fields.";
  }

  if ( req.body.password !== req.body.repassword ) {
    errors.message = "Passwords not equal";
  }

  if (errors.message !== "") {
    return callback(errors);
  }

  let userId = req.user.id;
  let newPassword = req.body.password;
  let message = "";
  let params = {email: req.user.email, name: req.user.firstName};

  usersService.changePassword(userId, newPassword, function(err, data){
    if (err) {
      return callback(err);
    }
    mailers.users.sendPasswordChangedSuccess(params);
    callback(null, successMessage, req.user);
  });
}

module.exports = {
  save: save,
  successMessage: successMessage
}
