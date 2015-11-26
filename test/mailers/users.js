"use strict";
var config = require('config');
var assert = require("chai").assert;

var usersMailer = require('./../../mailers/users.js');

describe('Mailer Users', () => {
  describe('sendEmailConfirmationSuccess ', () => {
    describe('success ', () => {
      var email = "testeEmail@gmail.com"
      var params = {'email': email}
      it('content', (done) =>  {
        usersMailer.sendEmailConfirmationSuccess(params, function(result) {
          assert.include(result.data.html, "Your email confirmed successfully");
          assert.include(result.data.to, email);
          done();
        });
      });
    });
  });

  describe('sendPasswordChangedSuccess ', () => {
    describe('success ', () => {
      var email = "testeEmail@gmail.com"
      var params = {'email': email}
      it('content', (done) =>  {
        usersMailer.sendPasswordChangedSuccess(params, function(result) {
          assert.include(result.data.html, "Your password changed successfully");
          assert.include(result.data.to, email);
          done();
        });
      });
    });
  });

  describe('sendEmailConfirmationToken ', () => {
    describe('success ', () => {
      var email = "testeEmail@gmail.com"
      var token= "56b429319232ba613b76749988de4555"
      var params = {'email': email, "token":token}
      it('content', (done) =>  {
        usersMailer.sendEmailConfirmationToken(params, function(result) {
          assert.include(result.data.html, "Please confirm your email");
          assert.include(result.data.to, email);
          assert.include(result.data.html, token);
          done();
        });
      });
    });
  });

  describe('sendResetPasswordToken ', () => {
    describe('success ', () => {
      var email = "testeEmail@gmail.com"
      var token= "56b429319232ba613b76749988de4555"
      var params = {'email': email, "token":token}
      it('content', (done) =>  {
        usersMailer.sendResetPasswordToken(params, function(result) {
          assert.include(result.data.html, "A request was made to change your password");
          assert.include(result.data.to, email);
          assert.include(result.data.html, token);
          done();
        });
      });
    });
  });

});
