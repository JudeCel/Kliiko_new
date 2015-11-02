"use strict";
var assert = require('assert');
var models  = require('./../../models');
var SocialProfile  = models.SocialProfile;
var SocialProfileRepo  = require('./../../repositories/socialProfile');
var User  = models.User;

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

      SocialProfileRepo.findOrCreateFacebook(attrs, function(errors, result) {
        SocialProfile.find({where: {id: result.id}, include: [ models.User ]}).done(function(socialProfile) {
          assert.equal(socialProfile.User.id, 1);
          assert.equal(socialProfile.User.accountName, "client1");
          assert.equal(socialProfile.providerUserId, attrs.id);
          assert.equal(socialProfile.provider, attrs.provider);
          done();
        })
      });
    });
  });
});
