'use strict';

var UserService = require('./../services/users');

var adminAttrs = {
  accountName: "admin",
  firstName: "admin",
  lastName: "user",
  password: "qwerty123",
  email: "admin@insider.com",
  confirmedAt: new Date()
}

UserService.create(adminAttrs, function(errors, user) {
  if(errors) {
    console.log(errors);
  }
  user.getOwnerAccount().done(function(results) {
    let account = results[0].AccountUser;
    account.update({ role: 'admin' });
  });
});

var userAttrs = {
  accountName: "user",
  firstName: "insider",
  lastName: "user",
  password: "qwerty123",
  email: "user@insider.com",
  confirmedAt: new Date()
}

UserService.create(userAttrs, function(errors, user) {
  if(errors) {
    console.log(errors);
  }
});
