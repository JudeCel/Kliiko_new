"use strict";
var assert = require('assert');
var models  = require('./../../../models');
var uniqueValidation  = require('./../../../models/validations/unique');
var Account  = models.Account;

describe('uniqueValidation', () => {
  describe.only('unique', () =>  {
    describe("account name variants", () =>  {
      var sql = uniqueValidation.unique(models.sequelize, 'Account', 'name', { lower: true })
      before((done) => {
        models.sequelize.sync({ force: true }).then(() => {
          Account.create({name: "DainisL"})
            .then(function() {
              done();
            }).catch(function(error) {
              done(error);
            });
        });
      });

      it('variant 1', (done) =>  {
        sql("dainis l", function(error) {
          if (error) {
            done()
          }
        });
      });

      it('variant 2', (done) =>  {
        sql("dainisl", function(error) {
          if (error) {
            done()
          }
        });
      });

      it('variant 3', (done) =>  {
        sql("Dainis l", function(error) {
          if (error) {
            done()
          }
        });
      });

      it('variant 4', (done) =>  {
        sql("Dainis L", function(error) {
          if (error) {
            done()
          }
        });
      });
    })
  });
});
