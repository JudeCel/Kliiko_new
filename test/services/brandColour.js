'use strict';

var models = require('./../../models');
var BrandProjectPreference = models.BrandProjectPreference;

var brandColourServices = require('./../../services/brandColour');
var sessionFixture = require('./../fixtures/session');
var brandProjectConstants = require('./../../util/brandProjectConstants');
var assert = require('chai').assert;
var _ = require('lodash');

describe('SERVICE - BrandColour', function() {
  var testData = {};

  beforeEach(function(done) {
    sessionFixture.createChat().then(function(result) {
      testData.user = result.user;
      testData.account = result.account;
      testData.session = result.session;
      testData.preference = result.preference;
      done();
    }, function(error) {
      done(error);
    });
  });

  afterEach(function(done) {
    models.sequelize.sync({ force: true }).then(() => {
      done();
    });
  });

  function accountParams() {
    return testData.account.id;
  };

  function testScheme(data, params) {
    if(!params) {
      params = { colours: brandProjectConstants.preferenceColours };
    }
    else if(!params.colours) {
      params.colours = brandProjectConstants.preferenceColours;
    }

    assert.equal(data.name, params.name || 'Default scheme');
    assert.equal(data.colours.browserBackground, params.colours.browserBackground || '#EFEFEF');
    assert.equal(data.colours.mainBackground, params.colours.mainBackground || '#FFFFFF');
    assert.equal(data.colours.mainBorder, params.colours.mainBorder || '#F0E935');
    assert.equal(data.colours.font, params.colours.font || '#58595B');
    assert.equal(data.colours.headerButton, params.colours.headerButton || '#4CBFE9');
    assert.equal(data.colours.consoleButtonActive, params.colours.consoleButtonActive || '#4CB649');
  }

  describe('#findScheme', function() {
    describe('happy path', function() {
      it('should succeed on finding scheme', function (done) {
        brandColourServices.findScheme({ id: testData.preference.id }, accountParams()).then(function(result) {
          assert.equal(result.data.accountId, accountParams());
          testScheme(result.data);
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail on finding scheme', function (done) {
        brandColourServices.findScheme({ id: testData.preference.id + 100 }, accountParams()).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, brandColourServices.messages.notFound);
          done();
        });
      });
    });
  });

  describe('#findAllSchemes', function() {
    describe('happy path', function() {
      it('should succeed on finding all schemes', function (done) {
        brandColourServices.findAllSchemes(accountParams()).then(function(results) {
          testScheme(results.data[0]);
          done();
        }, function(error) {
          done(error);
        });
      });
    });
  });

  describe('#createScheme', function() {
    describe('happy path', function() {
      it('should succeed on creating scheme', function (done) {
        BrandProjectPreference.count().then(function(c) {
          assert.equal(c, 1);

          brandColourServices.createScheme({ name: 'untitled' }, accountParams()).then(function(result) {
            testScheme(result.data, { name: 'untitled' });
            BrandProjectPreference.count().then(function(c) {
              assert.equal(c, 2);
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail because of colour regex', function (done) {
        BrandProjectPreference.count().then(function(c) {
          assert.equal(c, 1);

          brandColourServices.createScheme({ colours: { browserBackground: 'somerandomstring' } }, accountParams()).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            assert.deepEqual(error, { browserBackground: 'Browser Background: Not valid colour' });
            done();
          });
        });
      });
    });
  });

  describe('#updateScheme', function() {
    describe('happy path', function() {
      it('should succeed on updating scheme', function (done) {
        let attrs = sessionFixture.brandProjectPreferenceParams(accountParams());
        attrs.id = testData.preference.id;
        attrs.name = 'Other name';

        brandColourServices.updateScheme(attrs, accountParams()).then(function(result) {
          assert.equal(result.message, brandColourServices.messages.updated);
          testScheme(result.data, { name: attrs.name });
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
      it('should fail because not found', function (done) {
        let attrs = sessionFixture.brandProjectPreferenceParams(accountParams());
        attrs.id = testData.preference.id + 100;

        brandColourServices.updateScheme(attrs, accountParams()).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, brandColourServices.messages.notFound);
          done();
        });
      });

      it('should fail because of wrong params', function (done) {
        let attrs = sessionFixture.brandProjectPreferenceParams(accountParams());
        attrs.id = testData.preference.id;
        attrs.accountId = null;

        brandColourServices.updateScheme(attrs, accountParams()).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error.accountId, "Account Id can't be empty");
          done();
        });
      });

      it('should fail because of colour regex', function (done) {
        brandColourServices.updateScheme({ colours: { browserBackground: 'somerandomstring' } }, accountParams()).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.deepEqual(error, { browserBackground: 'Browser Background: Not valid colour' });
          done();
        });
      });
    });
  });

  describe('#removeScheme', function() {
    describe('happy path', function() {
      it('should succeed on deleting scheme', function (done) {
        BrandProjectPreference.count().then(function(c) {
          assert.equal(c, 1);

          brandColourServices.removeScheme({ id: testData.preference.id }, accountParams()).then(function(result) {
            assert.equal(result.message, brandColourServices.messages.removed);

            BrandProjectPreference.count().then(function(c) {
              assert.equal(c, 0);
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail because not found', function (done) {
        brandColourServices.removeScheme({ id: testData.preference.id + 100 }, accountParams()).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, brandColourServices.messages.notFound);
          done();
        });
      });
    });
  });

  describe('#copyScheme', function() {
    describe('happy path', function() {
      it('should succeed on copieing scheme', function (done) {
        BrandProjectPreference.count().then(function(c) {
          assert.equal(c, 1);

          brandColourServices.copyScheme({ id: testData.preference.id }, accountParams()).then(function(result) {
            testScheme(result.data);
            assert.equal(result.message, brandColourServices.messages.copied);

            BrandProjectPreference.count().then(function(c) {
              assert.equal(c, 2);
              done();
            });
          }, function(error) {
            done(error);
          });
        });
      });
    });

    describe('sad path', function() {
      it('should fail because not found', function (done) {
        brandColourServices.copyScheme({ id: testData.preference.id + 100 }, accountParams()).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, brandColourServices.messages.notFound);
          done();
        });
      });
    });
  });

  describe('#manageFields', function() {
    describe('happy path', function() {
      it('should succeed on returning fields', function (done) {
        let fields = brandColourServices.manageFields();
        assert.equal(fields.chatRoom.length, 6);
        done();
      });
    });
  });
});
