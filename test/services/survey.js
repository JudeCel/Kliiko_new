'use strict';

var models = require('./../../models');
var Survey = models.Survey;

var surveyServices  = require('./../../services/survey');
var usersServices  = require('./../../services/users');
var assert = require('chai').assert;

describe('SERVICE - Survey', function() {
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
    surveyServices.findAllSurveys({ accountOwnerId: testAccount.id }).then(
      function(res) {
        assert.deepEqual(res, []);
        done();
      },
      function(err) {
        console.log(err);
        done();
      }
    );
  });
});
