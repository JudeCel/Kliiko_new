"use strict";
var assert = require('assert');
var models = require('./../../models');

describe('Mail Template Task', () => {

    describe("success", function () {
        beforeEach((done) => {
            models.sequelize.sync({ force: true }).done((error, result) => {
                done();
            });
        });

        it.only("run task", (done) => {
          //todo: run udpate
          //require('./../../tasks/updateBaseMailTemplates.js');
          done();
        });
    });

});
