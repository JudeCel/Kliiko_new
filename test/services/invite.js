'use strict';

var models = require('./../../models');
var userService = require('./../../services/users');
var inviteService = require('./../../services/invite');
var assert = require('chai').assert;

var testUser1 = null, testUser2 = null, testAccount = null;

describe('SERVICE - Invite', function() {
  beforeEach(function(done) {
    let attrs1 = {
      accountName: "Lilo",
      firstName: "Lilu",
      lastName: "Dalas",
      password: "multipassword",
      email: "lilu.tanya@gmail.com",
      gender: "male"
    };

    let attrs2 = {
      accountName: "DainisL",
      firstName: "Dainis",
      lastName: "Lapins",
      password: "cool_password",
      email: "dainis@gmail.com",
      gender: "male"
    }

    models.sequelize.sync({ force: true }).then(() => {
      userService.create(attrs1, function(err, user) {
        testUser1 = user;
        user.getOwnerAccount().then(function(accounts) {
          testAccount = accounts[0];
          userService.create(attrs2, function(err, user) {
            testUser2 = user;
            done();
          });
        })
      });
    });
  });

  function validParams() {
    return {
      userId: testUser2.id,
      accountId: testAccount.id,
      role: 'accountManager',
      userType: 'new'
    };
  };

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  describe('#createInvite', function() {
    describe('sad path', function() {
      it('should fail without params', function (done) {
        inviteService.createInvite({}, false, function(error, invite) {
          assert.equal(error.name, 'SequelizeValidationError');
          assert.equal(invite, null);
          done();
        });
      });
    });

    describe('happy path', function() {
      it('should succeed and return invite', function (done) {
        let params = validParams();
        inviteService.createInvite(params, false, function(error, invite) {
          assert.equal(error, null);
          assert.equal(invite.userId, params.userId);
          assert.equal(invite.accountId, params.accountId);
          assert.equal(invite.role, params.role);
          assert.equal(invite.userType, params.userType);
          done();
        });
      });

      it('should succeed, send email and return invite', function (done) {
        let params = validParams();
        inviteService.createInvite(params, true, function(error, invite) {
          done('not finished');
        });
      });
    });
  });

});
