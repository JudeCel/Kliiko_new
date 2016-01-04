"use strict";
var models  = require('./../../../models');
var user  = models.User;
var account  = models.Account;
var usersServices  = require('./../../../services/users');
var gallery  = require('./../../../services/account/gallery');
var assert = require('assert');

describe('Gallery', function() {
  var testUser = null;
  var testAccount = null;

  beforeEach(function(done) {
    var attrs = {
      accountName: "BLauris",
      firstName: "Lauris",
      lastName: "Blīgzna",
      password: "multipassword",
      email: "bligzna.lauris@gmail.com",
      gender: "male"
    }

    models.sequelize.sync({ force: true }).then(() => {
      usersServices.create(attrs, function(errors, user) {
        testUser = user;
        user.getOwnerAccount().then(function(accounts) {
          testAccount = accounts[0];
          done();
        });
      });
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  it('finds all account gallery records', function (done) {
    gallery.findAllRecords(testAccount.id).then(
      function(res) {
        console.log(res);
        done();
      },
      function(err) {
        console.log(err);
        done();
      }
    )
  });

});
