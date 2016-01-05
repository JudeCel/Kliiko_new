"use strict";
var models  = require('./../../../models');
var user  = models.User;
var account  = models.Account;
var usersServices  = require('./../../../services/users');
var gallery  = require('./../../../services/account/gallery');
var assert = require('chai').assert;

describe('Gallery', function() {
  var testUser = null;
  var testAccount = null;

  beforeEach(function(done) {
    var attrs = {
      accountName: "BLauris",
      firstName: "Lauris",
      lastName: "Blīgzna",
      password: "multipassword",
      email: "bligzna.lauris@gmail.com",
      gender: "male"
    }

    models.sequelize.sync({ force: true }).then(() => {
      usersServices.create(attrs, function(errors, user) {
        testUser = user;
        user.getOwnerAccount().then(function(accounts) {
          testAccount = accounts[0];
          done();
        });
      });
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  // it('finds all account gallery records', function (done) {
  //   gallery.findAllRecords(testAccount.id).then(
  //     function(res) {
  //       assert.deepEqual(res, []);
  //       done();
  //     },
  //     function(err) {
  //       assert.equal(res, null);
  //       done();
  //     }
  //   );
  // });

  describe('upload validations', function() {
    function defaultFile(params) {
      let json = {};
      json = {
        originalname: params.originalname || 'profile_test.png',
        encoding: params.encoding || '7bit',
        mimetype: params.mimetype || 'image/png',
        destination: params.destination || 'test/fixtures/uploadGallery/test',
        filename: params.filename || 'success.png',
        path: params.path || 'test/fixtures/uploadBanner/test/success.png',
        size: params.size || 10000
      };
      return json;
    }

    it('trying to upload to big file', function (done) {
      let file = defaultFile({});
      let params = {
        uploadType: "image", 
        file
      }

      // console.log(params);
      done();

      gallery.uploadNew(params).then(
        function(res) {
          assert.deepEqual(res, null);
          done();
        },
        function(err) {
          console.log(err);
          // assert.equal(res, null);
          done();
        }
      );
    });

  });

});
