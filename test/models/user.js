"use strict";
var assert = require('assert');
var User  = require('./../../models').User;

describe('User', () => {
  describe('set encrypte password',  ()=>  {
    before((done) => {
      User.sync({ force: true }).then(() => {
        done();
      });
    });


    it('set encrypte password', (done) =>  {
      let attrs = {
        first_name: "Dainis",
        last_name: "Lapins",
        password: "cool_password",
        email: "dainis@gmail.com"
      }
      User.build(attrs).validate().done(function(errors, user) {
        assert.equal(errors, undefined);
        done();
      });
    });
  });
});
