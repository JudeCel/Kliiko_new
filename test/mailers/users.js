"use strict";
var assert = require("chai").assert;

var usersMailer = require('./../../mailers/users.js');

describe('Mailer Users', () => {
  describe('sendEmailConfirmationSuccess ', () => {
    describe('success ', () => {
      let email = "testeEmail@gmail.com";
      let params = { 'email': email };
      it('content', (done) =>  {
        usersMailer.sendEmailConfirmationSuccess(params, function(err, result) {
          assert.include(result.data.html, "Your email confirmed successfully");
          assert.include(result.data.to, email);
          done();
        });
      });
    });
  });

  describe('sendPasswordChangedSuccess ', () => {
    describe('success ', () => {
      let email = "testeEmail@gmail.com";
      let params = { 'email': email };
      it('content', (done) =>  {
        usersMailer.sendPasswordChangedSuccess(params, function(err, result) {
          assert.include(result.data.html, "you have successfully changed your Password!");
          assert.include(result.data.to, email);
          done();
        });
      });
    });
  });

  describe('sendEmailConfirmationToken ', () => {
    describe('success ', () => {
      let email = "testeEmail@gmail.com";
      let token = "56b429319232ba613b76749988de4555";
      let params = { 'email': email, "token": token };
      it('content', (done) =>  {
        usersMailer.sendEmailConfirmationToken(params, function(err, result) {
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
      let email = "testeEmail@gmail.com";
      let token= "56b429319232ba613b76749988de4555";
      let params = { 'email': email, "token": token };
      it('content', (done) =>  {
        usersMailer.sendResetPasswordToken(params, function(err, result) {
          assert.include(result.data.html, "this is to confirm you wish to Change your Password");
          assert.include(result.data.to, email);
          assert.include(result.data.html, token);
          done();
        });
      });
    });
  });

});
