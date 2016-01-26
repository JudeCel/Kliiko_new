'use strict';

var models = require('./../../models');
var Survey = models.Survey;

var brandColourServices = require('./../../services/brandColour');
var sessionFixture = require('./../fixtures/session');
var assert = require('chai').assert;

describe('SERVICE - BrandColour', function() {
  var testUser, testAccount, testSession;

  beforeEach(function(done) {
    sessionFixture.createChat().then(function(result) {
      testUser = result.user;
      testAccount = result.account;
      testSession = result.session;
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
    return { id: testAccount.id };
  };

  describe('#findAllSchemes', function() {
    describe('happy path', function() {
      it('should succeed on finding schemes', function (done) {
        brandColourServices.findAllSchemes(accountParams()).then(function(results) {
          assert.equal(results.data[0].name, 'Default scheme');
          assert.equal(results.data[0].colour_browser_background, '#def1f8');
          assert.equal(results.data[0].colour_background, '#fff');
          assert.equal(results.data[0].colour_border, '#e51937');
          assert.equal(results.data[0].colour_whiteboard_background, '#e1d8d8');
          assert.equal(results.data[0].colour_whiteboard_border, '#a4918b');
          assert.equal(results.data[0].colour_whiteboard_icon_background, '#408d2');
          assert.equal(results.data[0].colour_whiteboard_icon_border, '#a4918b');
          assert.equal(results.data[0].colour_menu_background, '#679fd2');
          assert.equal(results.data[0].colour_menu_border, '#043a6b');
          assert.equal(results.data[0].colour_icon, '#e51937');
          assert.equal(results.data[0].colour_text, '#e51937');
          assert.equal(results.data[0].colour_label, '#679fd2');
          assert.equal(results.data[0].colour_button_background, '#a66500');
          assert.equal(results.data[0].colour_button_border, '#ffc973');
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
    });
  });

  describe('#createScheme', function() {
    describe('happy path', function() {
      it('should succeed on finding schemes', function (done) {
        let attrs = sessionFixture.brandProjectPreferenceParams(testSession.id, testSession.brand_project_id);
        brandColourServices.createScheme(attrs).then(function(results) {
          assert.equal(results.data.name, 'Default scheme');
          assert.equal(results.data.colour_browser_background, '#def1f8');
          assert.equal(results.data.colour_background, '#fff');
          assert.equal(results.data.colour_border, '#e51937');
          assert.equal(results.data.colour_whiteboard_background, '#e1d8d8');
          assert.equal(results.data.colour_whiteboard_border, '#a4918b');
          assert.equal(results.data.colour_whiteboard_icon_background, '#408d2');
          assert.equal(results.data.colour_whiteboard_icon_border, '#a4918b');
          assert.equal(results.data.colour_menu_background, '#679fd2');
          assert.equal(results.data.colour_menu_border, '#043a6b');
          assert.equal(results.data.colour_icon, '#e51937');
          assert.equal(results.data.colour_text, '#e51937');
          assert.equal(results.data.colour_label, '#679fd2');
          assert.equal(results.data.colour_button_background, '#a66500');
          assert.equal(results.data.colour_button_border, '#ffc973');
          done();
        }, function(error) {
          done(error);
        });
      });
    });

    describe('sad path', function() {
    });
  });
});
