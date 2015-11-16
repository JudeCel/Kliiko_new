"use strict";
var usersRepo  = require('./users');

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

  usersRepo.changePassword(req.user.id, req.body.password, function(err, data){
    if (err) {
      return callback(err);
    }
    callback(null, req.user);
  });
}

module.exports = {
  save: save
}
