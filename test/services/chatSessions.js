'use strict';

var models = require('./../../models');
var usersServices = require('./../../services/users');
var chatSessionSeeder = require('./../../seeders/chatSession.js');
var ChatSessions = require('./../../services/chatSessions.js');
var Account = models.Account;
var assert = require('chai').assert;


describe('SERVICE - ChatSessions', function() {
  // var testUser = null;
  // var testAccount = null;
  // var testAccountUser = null;
  var testSessionId = null;

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
      chatSessionSeeder.createChat(function(result) {
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        console.log(result);
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        done();
      })
      // usersServices.create(attrs, function(errors, user) {
      //   testUser = user;
      //   user.getOwnerAccount().then(function(accounts) {
      //     user.getAccountUsers().then(function(results) {
      //       testAccountUser = results[0]
      //       testAccount = accounts[0];
      //       done();
      //     })
      //   });
      // });
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  it("Get all account sessions", function(done) {
    ChatSessions.getAllSessions(testAccount.id).then(function(result) {
      assert.equal(result.status, "OK") // A placeholder for now
      done();
    }, function(error) {
      done('Should not get here!');
    });
  })

  it("copy session", function(done) {
    let sessionId = 1;

    ChatSessions.copySession(sessionId).then(function(result) {
      // body...
    }, function(error) {
      done('Should not get here!');
    })
  })

  describe('Delete session', function() {
    let sessionId = 1;

    it("happy path", function(done) {
      ChatSessions.deleteSession(sessionId).then(function(result) {
        // body...
      }, function(error) {
        done('Should not get here!');
      })
    })

    it("sad path", function(done) {
      ChatSessions.deleteSession(sessionId).then(function(result) {
        done('Should not get here!');
      }, function(error) {
        // body...
      })
    })
  })

});
