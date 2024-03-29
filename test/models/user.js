"use strict";
var assert = require('assert');
var models  = require('./../../models');
var testDatabase = require("../database");
var User  = models.User;
var encryptedPasswordLength = 60;

describe('User', () => {
  describe('set encrypte password',  ()=>  {
    beforeEach((done) => {
      testDatabase.prepareDatabaseForTests().then(() => {
        done();
      });
    });

    it('success', (done) =>  {
      let attrs = {
        accountName: "DainisL",
        firstName: "Dainis",
        lastName: "Lapins",
        password: "cool_password",
        email: "dainis@gmail.com",
        gender: "male"
      }
      User.create(attrs)
        .then(function(user) {
          assert.equal(user.tipsAndUpdate, true);
          assert.equal(user.encryptedPassword.length, encryptedPasswordLength);
          done();
        }).catch(function(error) {
          assert.equal(error, undefined);
          done(error);
        });
    });
  });

  describe('unique email',  ()=>  {
    var attrs = {
      accountName: "DainisL",
      firstName: "Dainis",
      lastName: "Lapins",
      password: "cool_password",
      email: "dainis@gmail.com",
      gender: "male"
    }
    var testUser = null;
    let firstName = 'newName';
    let email = 'dainis@gmail.com';
    beforeEach((done) => {
      testDatabase.prepareDatabaseForTests().then(() => {
        User.build(attrs).save()
          .then(function(user) {
            testUser = user;
            done();
          });
      });
    });

    it('return unique validation error', (done) =>  {
      User.build(attrs).save()
        .then(function(user) {
          throw new Error("should not get there");
          done();
        })
        .catch(function(error) {
          assert.equal(error.errors[0].message, 'Email must be unique');
          done();
        });
    });
  });
});
