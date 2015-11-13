"use strict";
var usersRepo  = require('./users');

function save(req, callback){

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
