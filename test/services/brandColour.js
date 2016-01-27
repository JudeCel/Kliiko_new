'use strict';

var models = require('./../../models');
var BrandProjectPreference = models.BrandProjectPreference;

var brandColourServices = require('./../../services/brandColour');
var sessionFixture = require('./../fixtures/session');
var assert = require('chai').assert;

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
    return { id: testData.account.id };
  };

  function testScheme(data, params) {
    if(!params) {
      params = {};
    }

    assert.equal(data.name, params.name || 'Default scheme');
    assert.equal(data.colour_browser_background, params.colour_browser_background || '#def1f8');
    assert.equal(data.colour_background, params.colour_background || '#ffffff');
    assert.equal(data.colour_border, params.colour_border || '#e51937');
    assert.equal(data.colour_whiteboard_background, params.colour_whiteboard_background || '#e1d8d8');
    assert.equal(data.colour_whiteboard_border, params.colour_whiteboard_border || '#a4918b');
    assert.equal(data.colour_whiteboard_icon_background, params.colour_whiteboard_icon_background || '#408D2F');
    assert.equal(data.colour_whiteboard_icon_border, params.colour_whiteboard_icon_border || '#a4918b');
    assert.equal(data.colour_menu_background, params.colour_menu_background || '#679fd2');
    assert.equal(data.colour_menu_border, params.colour_menu_border || '#043a6b');
    assert.equal(data.colour_icon, params.colour_icon || '#e51937');
    assert.equal(data.colour_text, params.colour_text || '#e51937');
    assert.equal(data.colour_label, params.colour_label || '#679fd2');
    assert.equal(data.colour_button_background, params.colour_button_background || '#a66500');
    assert.equal(data.colour_button_border, params.colour_button_border || '#ffc973');
  }

  describe('#findScheme', function() {
    describe('happy path', function() {
      it('should succeed on finding scheme', function (done) {
        brandColourServices.findScheme({ id: testData.preference.id }, accountParams()).then(function(result) {
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
        let attrs = sessionFixture.brandProjectPreferenceParams(testData.session.id, testData.session.brand_project_id);
        BrandProjectPreference.count().then(function(c) {
          assert.equal(c, 1);

          brandColourServices.createScheme(attrs).then(function(result) {
            testScheme(result.data);
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
      it('should fail because of wrong params', function (done) {
        BrandProjectPreference.count().then(function(c) {
          assert.equal(c, 1);

          brandColourServices.createScheme({}).then(function(result) {
            done('Should not get here!');
          }, function(error) {
            BrandProjectPreference.count().then(function(c) {
              assert.equal(c, 1);
              done(error);
            });
          });
        });
      });
    });
  });

  describe('#updateScheme', function() {
    describe('happy path', function() {
      it('should succeed on updating scheme', function (done) {
        let attrs = sessionFixture.brandProjectPreferenceParams(testData.session.id, testData.session.brand_project_id);
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
        let attrs = sessionFixture.brandProjectPreferenceParams(testData.session.id, testData.session.brand_project_id);
        attrs.id = testData.preference.id + 100;

        brandColourServices.updateScheme(attrs, accountParams()).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error, brandColourServices.messages.notFound);
          done();
        });
      });

      it('should fail because of wrong params', function (done) {
        let attrs = sessionFixture.brandProjectPreferenceParams(testData.session.id, testData.session.brand_project_id);
        attrs.id = testData.preference.id;
        attrs.sessionId = null;

        brandColourServices.updateScheme(attrs, accountParams()).then(function(result) {
          done('Should not get here!');
        }, function(error) {
          assert.equal(error.sessionId, 'Session Id: cannot be empty');
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
        assert.equal(fields[0].title, 'Browser Background');
        assert.equal(fields[0].model, 'colour_browser_background');
        done();
      });
    });
  });
});
