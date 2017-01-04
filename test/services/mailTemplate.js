"use strict";
var assert = require('assert');
var models = require('./../../models');
var mailTemplateService = require('./../../services/mailTemplate.js');
var mailTemplateSender = require('./../../mailers/mailTemplate.js');

describe('Mail Template Service', () => {
  var validAttrs = {
    name: "Test Name",
    subject: "Test Subject",
    content: "<p>Test Content</p>",
    systemMessage: 1
  };

  var invalidAttrsEmptyField = {
    name: "Test Name",
    subject: "Test Subject"
  };

  describe("success", function () {
    beforeEach((done) => {
      models.sequelize.sync({ force: true }).done((error, result) => {
        done();
      });
    });
    
    it("validate", (done) => {
      mailTemplateService.validate(validAttrs, (err, result)=>{
        if (err) {
          done(err)
        } else {
          assert.deepEqual(validAttrs, result);
          done();
        }
      });
    });
    
    it("should create mail template", (done) => {
      mailTemplateService.create(validAttrs, function (error, result) {
        assert.equal(error, null);
        mailTemplateService.deleteMailTemplate(result.id, function (error, deleteResult) {
          assert.equal(error, null);
          done();
        });
      });
    });

    it("should delete mail template", (done) => {
      mailTemplateService.create(validAttrs, function (error, result) {
        mailTemplateService.deleteMailTemplate(result.id, function (error, deleteResult) {
          assert.equal(error, null);
          done();
        });
      });
    });

    it("should create mail template resource relation", (done) => {
      //todo: create resource and mail template, check created relations
      done();
      //mailTemplateService.create(validAttrs, function (error, result) {
      //  done();
      //});
    });
  });

  describe("failed", function () {
    it("should fail creating mail template with empty parameter", (done) => {
      beforeEach((done) => {
        models.sequelize.sync({ force: true }).done((error, result) => {
          done();
        });
      });
      mailTemplateService.create(invalidAttrsEmptyField, function (error, user) {
        assert.notEqual(error, null)
        done();
      });
    });
  });
});
