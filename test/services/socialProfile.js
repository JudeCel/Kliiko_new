'use strict';

var models = require('./../../models');
var SocialProfile = models.SocialProfile;
var userServices = require('./../../services/users');

var _ = require('lodash');
var assert = require('chai').assert;

describe('SERVICE - SocialProfile', function() {
  describe('Facebook', function() {
    var validAttrs = {
      accountName: 'DainisL',
      firstName: 'Dainis',
      lastName: 'Lapins',
      password: 'cool_password',
      email: 'dainis@gmail.com',
      gender: 'male',
      socialProfile: { provider: 'facebook', id: '918975494859219' }
    }

    beforeEach(function(done) {
      models.sequelize.sync({ force: true }).done(function(error, result) {
        done();
      });
    });

    afterEach(function(done) {
      models.sequelize.sync({ force: true }).done(function(error, result) {
        done();
      });
    });

    describe('happy path', function() {
      it('should succeed', function(done) {
        userServices.create(validAttrs, function(error, user) {
          if(error) {
            done(error);
          }
          else {
            SocialProfile.find({
              where: {
                userId: user.id,
                provider: validAttrs.socialProfile.provider,
                providerUserId: validAttrs.socialProfile.id
              }
            }).then(function(profile) {
              if(profile) {
                done();
              }
              else {
                done('Social Profile not found!');
              }
            });
          }
        });
      });
    });

    describe('sad path', function() {
      beforeEach(function(done) {
        models.sequelize.sync({ force: true }).done(function(error, result) {
          userServices.create(validAttrs, function(errors, user) {
            done();
          });
        });
      });

      it('should fail', function(done) {
        let params = validAttrs;
        params.accountName = 'social';
        params.email = 'social@email.com';

        userServices.create(params, function(error, user) {
          if(error) {
            let errorParams = {
              provider: 'Provider has already been taken',
              providerUserId: 'Provider User Id has already been taken'
            }

            assert.deepEqual(error, errorParams);
            done();
          }
          else {
            done('Should not get here!');
          }
        });
      });
    });
  });
});
