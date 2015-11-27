'use strict';
var models = require('./../../models');
var TemplateBanner = models.TemplateBanner;
var uploadBanner = require('./../../services/uploadBanner');
var assert = require('assert');
var fs = require('fs-extra');

describe('Upload banner', function() {
  function defaultFile(params) {
    let json = {};
    json[params.fieldname || 'profile'] = [ {
      fieldname: params.fieldname || 'profile',
      originalname: params.originalname || 'profile_test.png',
      encoding: params.encoding || '7bit',
      mimetype: params.mimetype || 'image/png',
      destination: params.destination || 'test/fixtures/uploadBanner',
      filename: params.filename || 'success.png',
      path: params.path || 'test/fixtures/uploadBanner/success.png',
      size: params.size || 9993
    } ];
    return json;
  }

  before((done) => {
    models.sequelize.sync({force: true}).done((error, result) => {
      done();
    });
  });

  after((done) => {
    models.sequelize.sync({force: true}).done((error, result) => {
      done();
    });
  });

  beforeEach((done) => {
    fs.copySync('test/fixtures/uploadBanner/failureOrig.jpg', 'test/fixtures/uploadBanner/failure.jpg');
    fs.copySync('test/fixtures/uploadBanner/successOrig.png', 'test/fixtures/uploadBanner/success.png');
    done();
  });

  afterEach((done) => {
    fs.stat('test/fixtures/uploadBanner/failure.jpg', function (err, stat) {
      if(stat) {
        fs.unlink('test/fixtures/uploadBanner/failure.jpg');
      }
    })
    fs.stat('test/fixtures/uploadBanner/success.png', function (err, stat) {
      if(stat) {
        fs.unlink('test/fixtures/uploadBanner/success.png');
      }
    })
    fs.stat('test/fixtures/uploadBanner/profile_test.png', function (err, stat) {
      if(stat) {
        fs.unlink('test/fixtures/uploadBanner/profile_test.png');
      }
    })

    done();
  });

  describe('#write', function() {
    describe('sad path', function() {
      it('has no file', function (done) {
        uploadBanner.write({}, function (error, message) {
          assert.equal(error, 'No files selected or not an image');
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
          let json = defaultFile({ path: 'test/fixtures/uploadBanner/failure.jpg', filename: 'failure.jpg' });
          uploadBanner.write(json, function (error, message) {
            assert.equal(error['profile'], 'File size is out of range. Allowed size is 768x200px.');
            done();
          });
        });
      });
    });

    describe('happy path', function() {
      it('will succeed', function (done) {
        let json = defaultFile({});
        uploadBanner.write(json, function (error, message, array) {
          assert.equal(error, null);
          assert.equal(message, 'Successfully uploaded banner');
          assert.equal(array[0]['page'], 'profile');
          assert.equal(array[0]['filepath'], 'banners/profile_test.png');
          fs.unlink('test/fixtures/uploadBanner/profile_test.png');
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
      uploadBanner.write(json, function (error, message, array) {
        assert.equal(error, null);
        assert.equal(message, 'Successfully uploaded banner');
        assert.equal(array[0]['page'], 'profile');
        assert.equal(array[0]['filepath'], 'banners/profile_test.png');
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
      uploadBanner.write(json, function (error, message, array) {
        assert.equal(error, null);
        assert.equal(message, 'Successfully uploaded banner');
        assert.equal(array[0]['page'], 'profile');
        assert.equal(array[0]['filepath'], 'banners/profile_test.png');

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
      assert.deepEqual(params, { title: 'Upload banner', error: { message: 'some error' }, message: 'some message', banners: {} });
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
