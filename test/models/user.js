"use strict";
var assert = require('assert');
var models  = require('./../../models');
var User  = models.User;
var encryptedPasswordLength = 60
describe('User', () => {
  describe('set encrypte password',  ()=>  {
    beforeEach((done) => {
      models.sequelize.sync({ force: true }).then(() => {
        done();
      });
    });

    it('set encrypte password', (done) =>  {
      let attrs = {
        accountName: "DainisL",
        firstName: "Dainis",
        lastName: "Lapins",
        password: "cool_password",
        email: "dainis@gmail.com",
        gender: "male"
      }
      User.build(attrs).save()
        .then(function(user) {
          assert.equal(user.tipsAndUpdate, 'on');
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
      models.sequelize.sync({ force: true }).then(() => {
        User.build(attrs).save()
          .then(function(user) {
            testUser = user;
            done();
          });
      });
    });

    it('can update from instance with existing record!', (done) =>  {
      testUser.update({firstName: firstName, email: email})
        .then(function(user) {
          assert.equal(user.firstName, firstName);
          assert.equal(user.email, email);
          done();
        })
        .catch(function(error) {
          done(error);
        });
    });

    it('return unique validation error', (done) =>  {
      User.build(attrs).save()
        .then(function(user) {
          throw new Error("should not get there");
          done();
        })
        .catch(function(error) {
          assert.equal(error.errors[0].message, 'already taken');
          done();
        });
    });

  });

  describe('requiredEmail validation',  ()=>  {
    beforeEach((done) => {
      models.sequelize.sync({ force: true }).then(() => {
        done();
      });
    });

    it('set true', (done) =>  {
      let attrs = {
        accountName: "DainisL",
        firstName: "Dainis",
        lastName: "Lapins",
        password: "cool_password",
        email: "dainis@gmail.com",
        gender: "male",
        requiredEmail: true
      }
      User.build(attrs).save()
        .then(function(user) {
          assert.equal(user.tipsAndUpdate, 'on');
          assert.equal(user.encryptedPassword.length, encryptedPasswordLength);
          done();
        }).catch(function(error) {
          assert.equal(error, undefined);
          done();
        })
    });

    it('set true and email is empty', (done) =>  {
      let attrs = {
        accountName: "DainisL",
        firstName: "Dainis",
        lastName: "Lapins",
        password: "cool_password",
        gender: "male",
        email: "",
        requiredEmail: true
      }

      User.build(attrs).save()
        .then(function(user) {
          throw new Error("should not get there");
          done();
        }).catch(function(error) {
          assert.equal(error.errors[0].message, 'Invalid e-mail format');
          done();
        })
    });

    it('set false', (done) =>  {
      let attrs = {
        accountName: "DainisL",
        firstName: "Dainis",
        lastName: "Lapins",
        password: "cool_password",
        gender: "male",
        email: "",
        requiredEmail: false
      }

      User.build(attrs).save()
        .then(function(user) {
          assert.equal(user.tipsAndUpdate, 'on');
          assert.equal(user.encryptedPassword.length, encryptedPasswordLength);
          done();
        }).catch(function(error) {
          throw new Error("should not get there");
          done();
        })
    });
  });
});
