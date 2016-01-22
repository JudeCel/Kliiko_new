"use strict";
var assert = require('assert');
var models = require('./../../models');
var mailTemplateService = require('./../../services/mailTemplate.js');

describe('Mail Template Service', () => {
    describe("success", function () {
        beforeEach((done) => {
            models.sequelize.sync({ force: true }).done((error, result) => {
                done();
            });
        });
        it("should create mail template", (done) => {
            var template = {
                name: "Test Name",
                subject: "Test Subject",
                content: "<p>Test Content</p>"
            }
            mailTemplateService.create(template, function (error, result) {
                assert.equal(error, null);
                mailTemplateService.deleteMailTemplate(result.id, function (error, deleteResult) {
                    assert.equal(error, null);
                    done();
                });
            });
        });
    });

    describe("failed", function () {
        it("should fail creating mail template with no data", (done) => {
            beforeEach((done) => {
                models.sequelize.sync({ force: true }).done((error, result) => {
                    done();
                });
            });
            mailTemplateService.create(null, function (error, user) {
                assert.notEqual(error, null)
                done();
            });
        });
    });
});
