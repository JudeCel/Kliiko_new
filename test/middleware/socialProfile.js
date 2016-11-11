"use strict";
var assert = require("chai").assert;
var socialProfileMiddleware = require('./../../middleware/socialProfile.js');

describe('Social Profile Middleware', () => {
  it('assignProfileData facebook', (done) =>  {
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

    socialProfileMiddleware.assignProfileData(attrs, {}).then(function(result) {
      assert.equal(result.firstName, attrs.name.givenName);
      assert.equal(result.lastName, attrs.name.familyName);
      assert.equal(result.email, attrs._json.email);
      assert.equal(result.socialProfile.provider, attrs.provider);
      assert.equal(result.socialProfile.id, attrs.id);
      done();
    }, done);
  });

  it('assignProfileData Google', (done) =>  {
    let attrs = {
      provider: 'google',
      id: '308735433402234182096',
      displayName: 'Забуга Татьяна',
      name: { familyName: 'Татьяна', givenName: 'Забуга' },
      emails: [ { value: 'lilu.tanya@gmail.com', type: 'account' } ]
    }

    socialProfileMiddleware.assignProfileData(attrs, {}).then( function(result) {
      assert.equal(result.firstName, attrs.name.givenName);
      assert.equal(result.lastName, attrs.name.familyName);
      assert.equal(result.email, attrs.emails[0].value);
      assert.equal(result.socialProfile.provider, attrs.provider);
      assert.equal(result.socialProfile.id, attrs.id);
      done();
    }, done);
  });
})
