"use strict";
var assert = require('assert');
var models  = require('./../../models');
var SocialProfileService  = require('./../../services/socialProfile');
var UserService  = require('./../../services/users');

describe('Social Profile Service', () => {
  describe('Facebook',  () => {
    var validAttrs = {
      accountName: "DainisL",
      firstName: "Dainis",
      lastName: "Lapins",
      password: "cool_password",
      email: "dainis@gmail.com",
      gender: "male",
      socialProfile: { provider: 'facebook', id: '918975494859219' }
    }

    beforeEach((done) => {
      models.sequelize.sync({force: true}).done((error, result) => {
        done();
      });
    });

    afterEach(function(done) {
      models.sequelize.sync({force: true}).done((error, result) => {
        done();
      });
    });


    describe("succsess", function() {
      it("validate", (done) => {
        SocialProfileService.validate(validAttrs, (err, result)=>{
          if (err) {
            done(err)
          }else {
            assert.deepEqual(validAttrs, result);
            done();
          }
        });
      });
    });

    describe("failed", function() {
      beforeEach((done) => {
        models.sequelize.sync({force: true}).done((error, result) => {
          UserService.create(validAttrs, function(errors, user) {
            SocialProfileService.create(user, validAttrs, null, (err, socProfile) =>{
              done();
            });
          });
        });
      });

      it("validate", (done) => {
        SocialProfileService.validate(validAttrs, (err, result) => {
          if (err) {
            assert.equal(err, "Profile already exists!");
            done()
          }else {
            done("Not Get here!!!");
          }
        });
      });
    });

  });
});
