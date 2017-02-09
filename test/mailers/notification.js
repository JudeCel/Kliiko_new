'use strict';

var assert = require('chai').assert;
var notificationMailers = require('./../../mailers/notification.js');

describe('MAILERS - Notification ', () => {
  describe('sendNotification ', () => {
    let email = 'testEmail@gmail.com';
    let params = {
      unsubscribeMailUrl: '#',
      firstName: 'firstName',
      sessionName: 'session name',
      facilitatorFirstName: 'facilitator firstName',
      facilitatorLastName: 'facilitator lastName',
      facilitatorMail: email,
      email: email
    }

    it('content', (done) =>  {
      notificationMailers.sendNotification(params, function(error, result) {
        if(error) {
          done(error);
        } else {
          try {
            assert.include(result.html, 'You have notifications waiting for you');
            assert.include(result.accepted[0], email);
            done();
          } catch (e) {
            done(e);
          }
        }
      });
    });
  });
});
