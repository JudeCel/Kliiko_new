"use strict";
var models  = require('./../../models');
var User  = models.User;
var usersServices  = require('./../../services/users');
var resetPassword  = require('./../../services/resetPassword');
var assert = require('assert');
var bcrypt = require('bcrypt');
var testDatabase = require("../database");

describe('Reset Password', function() {

  var testToken = '123456';

  beforeEach(function(done) {
    var attrs = {
      accountName: "Lilo",
      firstName: "Lilu",
      lastName: "Dalas",
      password: "multipassword",
      email: "lilu.tanya@gmail.com",
      gender: "male",
      resetPasswordToken: testToken,
      resetPasswordSentAt: new Date(),
    }
    testDatabase.prepareDatabaseForTests().then(() => {
      User.build(attrs).save()
        .then(function(user) {
          done();
        });
    });
  });

  it('should return user for valid token', function (done) {
    resetPassword.checkTokenExpired(testToken, function(err, user){
      assert.equal(err, null);
      assert.equal(user.get('resetPasswordToken'), testToken);
      done();
    });
  });

  it('should return null for invalid token', function (done) {
    resetPassword.checkTokenExpired('12345678', function(err, user){
      assert.equal(user, undefined);
      done();
    });
  });

  it('should reset password  by token', function (done) {
    var req = {
      params: {
        token: testToken
      },
      body: {
        password: 'supermultipassword'
      }
    };

    resetPassword.resetByToken(req, function(err, user){
      assert.equal(err, null);

      User.update({
        confirmedAt: new Date()
      }, {
        where: {email: user.email}
      }).then(function (result) {
        usersServices.comparePassword(user.get("email"), req.body.password, function(failed, result) {
          assert.equal(failed, null);
          done();
        });
      })
    });
  });

});
