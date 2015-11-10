"use strict";
var models  = require('./../../models');
var User  = models.User;
var usersRepo  = require('./../../repositories/users');
var resetPassword  = require('./../../repositories/resetPassword');
var assert = require('assert');
var bcrypt = require('bcrypt');

describe('Reset Password', function() {

  var testToken = '123456';

  before(function(done) {
    var attrs = {
      accountName: "Lilo",
      firstName: "Lilu",
      lastName: "Dalas",
      password: "multipassword",
      email: "lilu.tanya@gmail.com",
      resetPasswordToken: testToken,
      resetPasswordSentAt: new Date(),
    }
    models.sequelize.sync({ force: true }).then(() => {
      User.build(attrs).save()
        .then(function(user) {
          done();
        });
    });
  });

  after(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  it('should return user for valid token', function (done) {
    resetPassword.checkTokenExpired(testToken, function(err, user){
      assert.equal(err, null);
      assert.equal(user.get('resetPasswordToken'), '123456');
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
      usersRepo.comparePassword(user.get("email"), req.body.password, function(failed, result) {
        assert.equal(failed, null);
        done();
      });
    });
  });

});