'use strict';

var models  = require('./../../models');
var userService  = require('./../../services/users');
var inviteService  = require('./../../services/invite');
var assert = require('chai');

describe('Account user service', function() {
  var testUser1 = null;
  var testUser2 = null;
  var testAccount = null;

  before(function(done) {
    var attrs = {
      accountName: "Lauris",
      firstName: "Lauris",
      lastName: "Blīgzna",
      password: "multipassword",
      email: "bligzna.lauris@gmail.com",
      gender: "male"
    }
    models.sequelize.sync({ force: true }).done(() => {
      userService.create(attrs, function(error, user) {
        testUser1 = user;

        attrs.accountName = "blauris";
        attrs.email = "bligzna1.lauris@gmail.com";
        userService.create(attrs, function(error, user) {
          testUser2 = user;
          user.getOwnerAccount().done(function(accounts) {
            testAccount = accounts[0];
            done();
          })
        });
      });
    });
  });

  after(function(done) {
    models.sequelize.sync({ force: true }).done(() => {
      done();
    });
  });

  it('#createNotOwner', function (done) {
    inviteService.declineInvite({ UserId: testUser1.id }, function(err, message) {
      console.log(err);
      console.log(message);
      done();
    })
  });
});
