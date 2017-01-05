"use strict";
var assert = require('assert');
var models = require('./../../models');
var mailTemplateService = require('./../../services/mailTemplate.js');
var mailTemplateSender = require('./../../mailers/mailTemplate.js');
var usersServices = require('./../../services/users');

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

    describe("MailTemplateResource", function () {
      var testAccount = null;
      var testAccountUser = null;

      var userAttrs = {
        accountName: "AlexS",
        firstName: "Alex",
        lastName: "Sem",
        password: "cool_password",
        email: "alex@gmail.com",
        gender: "male",
        mobile: "+1 123456789"
      }
      
      function resourceParams() {
        return {
          accountId: testAccount.id,
          name: "test",
          accountUserId: testAccountUser.id,
          type: "image",
          scope: "collage"
        }
      }

      beforeEach(function(done) {
        models.sequelize.sync({ force: true }).then(() => {
          usersServices.create(userAttrs, function(errors, user) {
            user.getOwnerAccount().then(function(accounts) {
              user.getAccountUsers().then(function(results) {
                testAccountUser = results[0];
                testAccount = accounts[0];
                done();
              })
            });
          });
        });
      });
      
      it("should create mail template resource relation", (done) => {
        models.Resource.create(resourceParams()).then(function (resource) {
          validAttrs.content = '<img src="http://test.com/img.jpg" style="max-width:600px;" data-resource-id="' + resource.id + '">';
          mailTemplateService.create(validAttrs, function (error, result) {
            assert.equal(error, null);
            models.MailTemplateResource.findAll({ where: { mailTemplateId: result.id } }).then(function (results) {
              assert.equal(results.length, 1);
              assert.equal(results[0].resourceId, resource.id);
              done();
            }, function(error) {
              done(error);          
            });
          });
        }, function(error) {
          done(error);          
        });
      });
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
        assert.notEqual(error, null);
        done();
      });
    });
  });
});
