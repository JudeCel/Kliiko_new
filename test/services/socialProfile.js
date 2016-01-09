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
      it('mapData facebook', (done) =>  {
        let attrs = { id: '918975494859219',
          username: undefined,
          displayName: undefined,
          name:
           { familyName: 'Lapiņš',
             givenName: 'Dainis',
             middleName: undefined },
          gender: undefined,
          profileUrl: undefined,
          emails: [ { value: 'dainis186@gmail.com' } ],
          provider: 'facebook',
          _raw: '{"id":"918975494859219","email":"dainis186\\u0040gmail.com","last_name":"Lapi\\u0146\\u0161","first_name":"Dainis"}',
          _json:
           { id: '918975494859219',
             email: 'dainis186@gmail.com',
             last_name: 'Lapiņš',
             first_name: 'Dainis' }
          }

        SocialProfileService.mapData(attrs,{}, function(errors, result) {
          assert.equal(result.firstName, attrs.name.givenName);
          assert.equal(result.lastName, attrs.name.familyName);
          assert.equal(result.email, attrs._json.email);
          done();
        });
      });

      it('mapData Google', (done) =>  {
        let attrs = {
          provider: 'google',
          id: '308735433402234182096',
          displayName: 'Забуга Татьяна',
          name: { familyName: 'Татьяна', givenName: 'Забуга' },
          emails: [ { value: 'lilu.tanya@gmail.com', type: 'account' } ]
        }

        SocialProfileService.mapData(attrs, {}, function(errors, result) {
          assert.equal(result.firstName, attrs.name.familyName);
          assert.equal(result.lastName, attrs.name.givenName);
          assert.equal(result.email, attrs.emails[0].value);
          done();
        });
      });

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
            SocialProfileService.create(user, validAttrs, (err, socProfile)=>{
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
