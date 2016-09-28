"use strict";

var assert = require('assert');
var models = require('./../../models');
var mailTemplates = require('./../fixtures/mailTemplates');
var updateBaseMailTemplatesLogic = require('./../../tasks/updateBaseMailTemplatesLogic.js');

describe('Mail Template Task', () => {

  describe("success", function () {
    beforeEach((done) => {
      models.sequelize.sync({ force: true }).done((error, result) => {
        mailTemplates.createMailTemplate().then(function() {
          done();
        });
      });
    });

    it.only("run task", (done) => {
      updateBaseMailTemplatesLogic.doUpdate({ skipLogs: true }).then(function() {
        done();
      }, function(error){
        done(error);
      });
    });
  });

});
