'use strict';

var assert = require('chai').assert;
var inviteMailers = require('./../../mailers/invite.js');

describe('MAILERS - Invite ', () => {
  describe('sendInviteAccountManager ', () => {
    let email = 'testeEmail@gmail.com';
    let token = '56b429319232ba613b76749988de4555';
    let params = { email: email, token: token, role: "accountManager" };

    it('content', (done) =>  {
      inviteMailers.sendInviteAccountManager(params, function(error, result) {
        if(error) {
          done(error);
        } else {
          try {
            assert.include(result.html, 'Hello! And welcome to klzii');
            assert.include(result.html, 'You can login anytime with your');
            assert.include(result.accepted[0], email);
            assert.include(result.html, token);
            done();
          } catch (e) {
            done(e);
          }
        }
      });
    });
  });
});
