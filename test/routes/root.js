"use strict";
var assert = require('assert');
var models  = require('./../../models');
var supertest = require("supertest");

var server = supertest.agent("http://localhost:5678");

describe('Root routes', () => {
  describe('index',  () => {
    beforeEach((done) => {
      models.sequelize.sync({force: true}).done((error, result) => {
        done();
      });
    });

    afterEach(function(done) {
      models.sequelize.sync({force: true}).done((error, result) => {
        done();
      });
    });

    it('succsess', (done) =>  {
      server
       .get("/")
       .expect("Content-type",/html/)
       .expect(200) // THis is HTTP response
       .end(function(err,res){
         assert.equal(res.status, 200);
         done();
       });
    });
  });
});
