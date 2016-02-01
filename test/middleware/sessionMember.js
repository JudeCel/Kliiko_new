"use strict";
var assert = require("chai").assert;
var sessionMember = require('./../../middleware/sessionMember.js');
var UserServices  = require('./../../services/users');
var models  = require('./../../models');
var Session  = models.Session;

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

describe('Middleware Session Member', () => {
  var session = null
  let req = { user: {id: null}, params: {id: null} }
  let res = { locals: { currentDomain: {id: null} } };

  beforeEach((done) => {
    models.sequelize.sync({force: true}).done((error, result) => {
      UserServices.create(validAttrs, function(errors, user) {
        user.getAccountUsers().then(function(accaountUsers) {
          req.user.id = user.id
          res.locals.currentDomain.id = accaountUsers[0].id
          Session.create(sessionAttrs).then(function(sess) {
            session = sess;
            done();
          });
        });
      });
    });
  });

  describe('success ', () => {
    beforeEach((done) => {
      req.params.id = session.id
      let params = {
        role: 'facilitator',
        accountUserId: res.locals.currentDomain.id,
        username: "name",
        avatar_info: "0:4:3:1:4:3"
      }

      session.createSessionMember(params)
      .then(function (result) {
        done();
      });
    });

    it('call next Callback when hasAccess', (done) =>  {
      sessionMember.hasAccess(req, res, done);
    });
  });

  describe('failed ', () => {
    it('Access Denied', (done) =>  {
      req.params.id = (session.id + session.id);
      let res = { locals: { currentDomain: {id: null} }, status: (argument) => { return { send: (test) => {
        assert.equal(test, sessionMember.accessDeniedMessage);
        done();
      } } } };

      sessionMember.hasAccess(req, res, () => { throw("can't get here") });
    });
  });
});
