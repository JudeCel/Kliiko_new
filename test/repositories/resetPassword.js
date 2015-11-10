"use strict";
var models  = require('./../../models');
var User  = models.User;
var userRepo  = require('./../../repositories/users');
var resetPassword  = require('./../../repositories/resetPassword');
var assert = require('assert');

describe('Expiration period', function() {

  before(function(done) {
    var attrs = {
      accountName: "Lilo",
      firstName: "Lilu",
      lastName: "Dalas",
      password: "multipassword",
      email: "lilu.tanya@gmail.com",
      resetPasswordToken: '123456',
      resetPasswordSentAt: new Date(),
    }
    models.sequelize.sync({ force: true }).then(() => {
      User.build(attrs).save()
        .then(function(user) {
          done();
        });
    });
  });

  it('should return user for valid token', function () {
    resetPassword.checkTokenExpired('123456', function(err, user){
      assert.equal(err, null);
      assert.equal(user.get('token'), '123456');
    });
  });

  it('should return null for valid token', function () {
    resetPassword.checkTokenExpired('123456', function(err, user){
      assert.equal(user, null);
    });
  });

});

describe('Password is changed', function() {

  before(function(done) {
    var attrs = {
      accountName: "Lilo",
      firstName: "Lilu",
      lastName: "Dalas",
      password: "multipassword",
      email: "lilu.tanya@gmail.com",
      resetPasswordToken: '12345678',
      resetPasswordSentAt: new Date(),
    }
    models.sequelize.sync({ force: true }).then(() => {
      User.build(attrs).save()
        .then(function(user) {
          done();
        });
    });
  });

  it('should reset password  by token', function () {
    var req = {
      params: {
        token: '123456'
      },
      body: {
        password: '12345679'
      }
    };

    resetPassword.resetByToken('123456', function(err, user){
      assert.equal(err, null);
      //
    });
  });

});