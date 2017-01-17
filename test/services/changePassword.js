"use strict";
var models  = require('./../../models');
var User  = models.User;
var usersRepo  = require('./../../services/users');
var changePassword  = require('./../../services/changePassword');
var assert = require('assert');

describe('Change Password', function() {

  var testUser = null;

  beforeEach(function(done) {
    var attrs = {
      accountName: "Lauris",
      firstName: "Lauris",
      lastName: "Blīgzna",
      password: "multipassword",
      email: "bligzna.lauris@gmail.com",
      gender: "male"
    }
    models.sequelize.sync({ force: true }).then(() => {
      User.build(attrs).save()
        .then(function(user) {
          testUser = user;
          done();
        });
    });
  });


  it('fails on password mismatch', function (done) {
    let attrs = {
      body: {
        password: 'correct',
        repassword: 'wrong'
      }
    }

    changePassword.save(attrs, function(errors, user){
      try {
        assert.equal(errors.message, 'Passwords not equal');
        done();
      } catch (e) {
        deone(e);
      } 
    });
  });

  it('fails on password not filled', function (done) {
    let attrs = {
      body: {
        password: '',
        repassword: ''
      }
    }

    changePassword.save(attrs, function(errors, user){
      assert.equal(errors.message, 'Please fill both password fields.');
      done();
    });
  });

  it('fails on password to short', function (done) {
    let attrs = {
      body: {
        password: '123',
        repassword: '123'
        },
      currentResources: {
        user: testUser.dataValues,
        accountUser: {
          firstName: testUser.dataValues.firstName
        }
      }
    }
    changePassword.save(attrs, function(errors, user){
      assert.equal(errors.message, 'Validation error: Make sure your Password is at least 7 characters');
      done();
    });
  });

  it('change the password', function (done) {
    let attrs = {
      body: {
        password: 'okpassword',
        repassword: 'okpassword'
      },
      currentResources: {
        user: testUser.dataValues,
        accountUser: {
          firstName: testUser.dataValues.firstName
        }
      }
    }
    changePassword.save(attrs, function(errors, message, user){
      assert.equal(message, changePassword.successMessage);
      done();
    });
  });
});
