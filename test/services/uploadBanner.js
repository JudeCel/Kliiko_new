'use strict';
var models = require('./../../models');
var TemplateBanner = models.TemplateBanner;
var uploadBanner = require('./../../services/uploadBanner');
var assert = require('chai').assert;
var fs = require('fs-extra');
var async = require('async');
var ncp = require('ncp').ncp;

var newPath = 'test/fixtures/uploadBanner/test';
describe('Upload banner', function() {
  function defaultFile(params) {
    let json = {};
    json[params.fieldname || 'profile'] = [ {
      fieldname: params.fieldname || 'profile',
      originalname: params.originalname || 'profile_test.png',
      encoding: params.encoding || '7bit',
      mimetype: params.mimetype || 'image/png',
      destination: params.destination || 'test/fixtures/uploadBanner/test',
      filename: params.filename || 'success.png',
      path: params.path || 'test/fixtures/uploadBanner/test/success.png',
      size: params.size || 9993
    } ];
    return json;
  }

  before((done) => {
    models.sequelize.sync({force: true}).done((error, result) => {
      done();
    });
  });

  beforeEach((done) => {
    fs.stat(newPath, function (err, stats) {
      if(!stats) {
        fs.mkdir(newPath, function() {
          ncp('test/fixtures/uploadBanner/orig', newPath, function(err) {
            done(err);
          });
        });
      }
      else {
        ncp('test/fixtures/uploadBanner/orig', newPath, function(err) {
          done(err);
        });
      }
    });
  });

  afterEach((done) => {
    fs.stat(newPath, function (err, stats) {
      if(stats) {
        fs.remove(newPath, function (err) {
          done(err);
        });
      }
      else {
        done();
      }
    });
  });


  describe('#write', function() {
    describe('sad path', function() {
      it('has no file', function (done) {
        uploadBanner.write({}, function (error, message) {
          assert.equal(error, 'No files selected');
          done();
        });
      });

      describe('at validations', function() {
        it('wrong file size', function (done) {
          let json = defaultFile({ size: 600000000 });
          uploadBanner.write(json, function (error, message) {
            assert.equal(error['profile'], 'This file is too big. Allowed size is 5MB.');
            done();
          });
        });

        it('wrong dimension', function (done) {
          let json = defaultFile({ path: 'test/fixtures/uploadBanner/test/failure.jpg', filename: 'failure.jpg' });
          uploadBanner.write(json, function (error, message) {
            assert.equal(error['profile'], 'File size is out of range. Allowed size is 768x200px.');
            done();
          });
        });

        it('wrong filetype', function (done) {
          let json = defaultFile({ path: 'test/fixtures/uploadBanner/test/failure.rb', filename: 'failure.rb' });
          uploadBanner.write(json, function (error, message) {
            assert.equal(error['profile'], 'Only image files are allowed -  gif, png, jpg, jpeg, bmp.');
            done();
          });
        });
      });
    });

    describe('happy path', function() {
      it('will succeed', function (done) {
        let json = defaultFile({});
        uploadBanner.write(json, function (error, message) {
          if(error) {
            done(error);
          }

          assert.equal(error, null);
          assert.equal(message, 'Successfully uploaded banner.');
          TemplateBanner.count().then(function(c) {
            assert.equal(c, 1);
            done();
          });
        });
      });
    });
  });

  describe('#destroy', function() {
    it('will succeed', function (done) {
      let json = defaultFile({});
      uploadBanner.write(json, function (error, message) {
        assert.equal(error, null);
        assert.equal(message, 'Successfully uploaded banner.');
        TemplateBanner.count().then(function(c) {
          assert.equal(c, 1);
        });
        uploadBanner.destroy('profile', function (error) {
          assert.equal(error, null);
          TemplateBanner.count().then(function(c) {
            assert.equal(c, 0);
            done();
          });
        });
      });
    });
  });

  describe('#profilePage', function() {
    it('will succeed', function (done) {
      let json = defaultFile({});
      uploadBanner.write(json, function (error, message) {
        assert.equal(error, null);
        assert.equal(message, 'Successfully uploaded banner.');

        uploadBanner.profilePage(function (error, result) {
          assert.equal(error, null);
          assert.equal(result.page, 'profile');
          assert.equal(result.filepath, 'banners/profile_test.png');
          done();
        });
      });
    });
  });

  describe('#simpleParams', function() {
    it('will succeed', function (done) {
      let params = uploadBanner.simpleParams('some error', 'some message');
      let result = { title: 'Upload banner', error: { message: 'some error' }, message: 'some message', banners: {} };
      assert.deepEqual(params, result);
      done();
    });
  });

  describe('#findAllBanners', function() {
    it('will succeed', function (done) {
      let json = defaultFile({});
      uploadBanner.write(json, function (error, message, array) {
        uploadBanner.findAllBanners(function (result) {
          assert.deepEqual(result, { profile: 'banners/profile_test.png' });
          done();
        });
      });
    });
  });
});
