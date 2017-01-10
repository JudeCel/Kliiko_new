"use strict";
var assert = require("chai").assert;
var models  = require('./../../models');

var usersMailer = require('./../../mailers/users.js');

describe.only('Mailer Users', () => {
  before((done) => {
    models.sequelize.sync({force: true}).done((error, result) => {
      done();
    });
  });

  describe('sendEmailConfirmationSuccess ', () => {
    describe('success ', () => {
      let email = "testeEmail@gmail.com";
      let params = { 'email': email };
      it('content', (done) =>  {
        usersMailer.sendEmailConfirmationSuccess(params, function(err, result) {
          assert.include(result.html, "Your email confirmed successfully");
          assert.include(result.accepted[0], email);
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
          assert.include(result.html, "Your password changed successfully");
          assert.include(result.accepted[0], email);
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
          assert.include(result.html, "Please verify your email address");
          assert.include(result.accepted[0], email);
          assert.include(result.html, token);
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
          assert.include(result.html, "A request was made to change your password");
          assert.include(result.accepted[0], email);
          assert.include(result.html, token);
          done();
        });
      });
    });
  });

});
