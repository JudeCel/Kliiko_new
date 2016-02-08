"use strict";
var assert = require('chai').assert;
var usersServices = require('./../../services/users');
var models  = require('./../../models');
var sessionBuilder  = require('./../../services/sessionBuilder');

describe("Session Builder", function() {
  let testUser = null;
  let testAccount = null;


  beforeEach(function(done) {
    let attrs = {
      accountName: "BLauris",
      firstName: "Lauris",
      lastName: "Dalas",
      password: "multipassword",
      email: "lilu.tanya@gmail.com",
      gender: "male"
    };

    models.sequelize.sync({ force: true }).then(() => {
      usersServices.create(attrs, function(errors, user) {
        // console.log("############# TEST USER");
        // console.log(user);
        testUser = user;
        user.getOwnerAccount().then(function(accounts) {
          user.getAccountUsers().then(function(results) {
            testAccount = accounts[0];
            done();
          })
        });
      });
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });


  it.only("Creates a new session in step 'setUp'", function(done) {
    let name = testAccount.name + "_user_" + testUser.id;
    let start_time = new Date();
    let end_time = new Date();
    end_time.setDate(end_time.getDate() + 10);

    let params =  {
      accountId: testAccount.id,
      name: name,
      start_time: start_time,
      end_time: end_time
    }

    sessionBuilder.setUp(params). then(function(result) {
      console.log("############# RESULT");
      console.log(result);
      done();
    }, function(error) {
      // console.log("############# ERROR");
      // console.log(error);
      done();
    })

  })

})