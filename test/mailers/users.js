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
});
