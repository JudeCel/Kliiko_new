"use strict";
var assert = require('assert');
var User  = require('./../../models').User;
var UserRepo  = require('./../../repositories/users');

describe('User Repo', () => {
  describe('Create',  () => {
    beforeEach((done) => {
      User.sync({force: true}).done((error, result) => {
        done();
      });
    });

    afterEach(function(done) {
      User.sync({force: true}).done((error, result) => {
        done();
      });
    });


    it('succsess', (done) =>  {
      let attrs = {
        first_name: "Dainis",
        last_name: "Lapins",
        password: "cool_password",
        email: "dainis@gmail.com"
      }

      UserRepo.create(attrs, function(errors, user) {
        assert.notEqual(errors, undefined);
        done()
      });
    });

    it('Fails', function(done){
      let attrs = {
        first_name: "Dainis",
        password: "cool",
        email: "dainis_gmail.com"
      }

      UserRepo.create(attrs, function(err, user) {
        assert.equal(err.errors.length, 3)
        done();
      });
    });
  });
});
