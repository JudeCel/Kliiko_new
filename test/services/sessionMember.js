"use strict";
var assert = require("chai").assert;
var sessionMember = require('./../../middleware/sessionMember.js');
var UserServices  = require('./../../services/users');
var models  = require('./../../models');
var Session  = models.Session;
var SessionMemberService  = require('./../../services/sessionMember');

var validAttrs = {
  accountName: "DainisL",
  firstName: "Dainis",
  lastName: "Lapins",
  password: "cool_password",
  email: "dainis@gmail.com",
  gender: "male"
}
var sessionAttrs = {
  name: "cool session",
  start_time: '01/01/2015',
  end_time:  new Date().setHours( new Date().getHours() + 2000),
  status_id: 1,
  colours_used: '["3","6","5"]'
}

describe('Service Session Member', () => {
  var TestSession = null;
  var TestSessionMember = null;
  var TestAccount = null;
  beforeEach((done) => {
    models.sequelize.sync({force: true}).done((error, result) => {
      UserServices.create(validAttrs, function(errors, user) {
        user.getAccountUsers().then(function(accaountUsers) {
          TestAccount = accaountUsers[0]
          sessionAttrs.accountId = TestAccount.id;
          Session.create(sessionAttrs).then(function(sess) {
            TestSession = sess;
            done();
          });
        });
      });
    });
  });

  describe('success ', () => {
    beforeEach((done) => {
      let params = {
        role: 'facilitator',
        accountUserId: TestAccount.id,
        username: "name",
        avatar_info: "0:4:3:1:4:3"
      }

      TestSession.createSessionMember(params).then(function (result) {
        TestSessionMember = result;
        done();
      });
    });

    it('create token', (done) =>  {
      SessionMemberService.createToken(TestSessionMember.id).then(function (result) {
        assert.isTrue(result);
        done()
      }, function(err) {
        done(err);
      })
    });
  });
  describe.only('failed ', () => {
    it('return error message not found', (done) =>  {
      let fakeId = 44444;
      SessionMemberService.createToken(44444).then(function (result) {
        done("should not come in here!!!");
      }, function(err) {
        assert.equal(err, SessionMemberService.MESSAGES.notFound + fakeId);
        done()
      })
    });
  });
});
