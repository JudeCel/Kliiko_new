'use strict';

var assert = require('chai').assert;
var inviteMailers = require('./../../mailers/invite.js');

describe.only('MAILERS - Invite ', () => {
  describe('sendInviteAccountManager ', () => {
    let email = 'testeEmail@gmail.com';
    let token = '56b429319232ba613b76749988de4555';
    let params = { email: email, token: token, role: "accountManager" };

    it('content', (done) =>  {
      inviteMailers.sendInviteAccountManager(params, function(error, result) {
        if(error) {
          done(error);
        }

        assert.include(result.data.html, 'Hello! And welcome to klzii');
        assert.include(result.data.html, 'You can login anytime with your');
        assert.include(result.data.to, email);
        assert.include(result.data.html, token);
        done();
      });
    });
  });
});
