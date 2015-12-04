"use strict";
var usersService  = require('./users');
var mailers = require('../mailers');

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
  let params = {email: req.user.email};

  usersService.changePassword(userId, newPassword, function(err, data){
    if (err) {
      return callback(err);
    }
    message = 'Password was changed successfully'
    mailers.users.sendPasswordChangedSuccess(params);
    callback(null, message, req.user);
  });
}

module.exports = {
  save: save
}
