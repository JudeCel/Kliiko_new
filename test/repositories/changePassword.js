"use strict";
var models  = require('./../../models');
var User  = models.User;
var usersRepo  = require('./../../repositories/users');
var changePassword  = require('./../../repositories/changePassword');
var assert = require('assert');
var bcrypt = require('bcrypt');

describe('Change Password', function() {

  var testUser = null;

  beforeEach(function(done) {
    var attrs = {
      accountName: "Lauris",
      firstName: "Lauris",
      lastName: "Blīgzna",
      password: "multipassword",
      email: "bligzna.lauris@gmail.com",
    }
    models.sequelize.sync({ force: true }).then(() => {
      User.build(attrs).save()
        .then(function(user) {
          testUser = user;
          done();
        });
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
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
      assert.equal(errors.message, 'Passwords not equal');
      done();
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
      user: testUser.dataValues
    }
    changePassword.save(attrs, function(errors, user){
      assert.equal(errors.message, 'Validation error: too short, must be at least 7 characters');
      done();
    });
  });

  it('change the password', function (done) {
    let attrs = { 
      body: { 
        password: 'okpassword', 
        repassword: 'okpassword' 
      },
      user: testUser.dataValues
    }
    changePassword.save(attrs, function(errors, message, user){
      assert.equal(message, 'Password successfully change.');
      done();
    });
  });
});