"use strict";
var assert = require('assert');
var models  = require('./../../models');
var SocialProfile  = models.SocialProfile;
var SocialProfileRepo  = require('./../../services/socialProfile');
var User  = models.User;

describe.skip('Social Profile Repo', () => {
  describe('Facebook and Google',  () => {
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

    it('facebook succsess', (done) =>  {
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

      SocialProfileRepo.findOrCreateUser(attrs, function(errors, result) {
        SocialProfile.find({where: {id: result.id}, include: [ models.User ]}).done(function(socialProfile) {
          assert.equal(socialProfile.User.id, 1);
          assert.equal(socialProfile.User.accountName, "client1");
          assert.equal(socialProfile.providerUserId, attrs.id);
          assert.equal(socialProfile.provider, attrs.provider);
          done();
        })
      });
    });

    it('google succsess', (done) =>  {
      let attrs = {
        provider: 'google',
        id: '308735433402234182096',
        displayName: 'Забуга Татьяна',
        name: { familyName: 'Татьяна', givenName: 'Забуга' },
        emails: [ { value: 'lilu.tanya@gmail.com', type: 'account' } ]
      }

      SocialProfileRepo.findOrCreateUser(attrs, function(errors, result) {
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
