"use strict";
var assert = require('assert');
var models  = require('./../../models');
var User  = models.User;
var Account  = models.Account;
var AccountUser  = models.AccountUser;
var UserRepo  = require('./../../services/users');
var validAttrs = {
  accountName: "DainisL",
  firstName: "Dainis",
  lastName: "Lapins",
  password: "cool_password",
  email: "dainis@gmail.com"
}

describe('User Repo', () => {
  describe('Create',  () => {
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

    it('Succsess User', (done) =>  {
      UserRepo.create(validAttrs, function(errors, user) {
        assert.equal(errors, null);
        assert.equal(user.firstName, attrs.firstName);
        done();
      });
    });

    describe('Ceate Account',  () => {
      var user = null;

      before((done) => {
        UserRepo.create(validAttrs, function(errors, result) {
          user = result
          done();
        });
      });

      it('Succsess', (done) =>  {
        User.find({where: {id: user.id}, include: [models.Account]}).then(function(result) {
          assert.equal(result.account.userId, user.id);
          done();
        }).catch(function(err) {
          done(err);
        })
      });
    });
    //
    // describe('Succsess AccountUser',  () => {
    //
    // });

    it('Fails', function(done){
      let attrs = {
        accountName: "DainisL",
        firstName: "Dainis",
        password: "cool",
        email: "dainis_gmail.com"
      }

      UserRepo.createUser(attrs, function(err, user) {
        assert.equal(Object.keys(err).length, 3)
        done();
      });
    });
  });
});
