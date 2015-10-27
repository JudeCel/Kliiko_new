"use strict";
var assert = require('assert');
var models  = require('./../../models');
var SocialProfile  = models.SocialProfile;
var SocialProfileRepo  = require('./../../repositories/socialProfile');
var User  = require('./../../models').User;

describe('Social Profile Repo', () => {
  describe('Facebook',  () => {
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


    it('succsess', (done) =>  {
      let attrs = {
        id: '918975494859219',
        username: undefined,
        displayName: 'Dainis Lapiņš',
        name:
         { familyName: undefined,
           givenName: undefined,
           middleName: undefined },
        gender: undefined,
        profileUrl: undefined,
        emails: [ { value: 'dainis186@gmail.com' } ],
        provider: 'facebook',
        _raw: '{"id":"918975494859219","name":"Dainis Lapi\\u0146\\u0161","email":"dainis186\\u0040gmail.com"}',
        _json:
         { id: '918975494859219',
           name: 'Dainis Lapiņš',
           email: 'dainis186@gmail.com' }
      }


      SocialProfileRepo.createFacebook(attrs, function(errors, user) {
        // assert.equal(errors, {});
        assert.equal(user.id, 1);
        done();
      });
    });
  });
});
