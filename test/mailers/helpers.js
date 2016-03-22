"use strict";
var assert = require("chai").assert;
var expect = require("chai").expect;
var helpers = require('./../../mailers/helpers.js');

var mailUrlPattern = "http://"+process.env.SERVER_DOMAIN+":"+process.env.SERVER_PORT;

describe('Mailer helpers', () => {
  describe('getUrl ', () => {
    describe('success ', () => {
      it('call next Callback', () =>  {

        let token = "token";
        let path = "/somePath";
        let url = helpers.getUrl(token, path);
        assert.equal(url, mailUrlPattern + path + token );

      });
    });
  });

  describe('createTransport ', () => {
    describe('success ', () => {
      it('creates a fake transport for testing', (done) =>  {

        let fakeTrans = helpers.createTransport();
        let fakeData = { datum1: "aString", datum2: 2, datum3: { iAmAnObject: true } };
        fakeTrans.sendMail(fakeData, function(err, response){
          assert.equal(response.data,fakeData);
          done();
        });

      });
    });
  });

  describe('renderMailTemplate ', () => {
    describe('success ', () => {
      it('renders a template into a string', (done) =>  {

        let filename= "testTemplate";
        let params = { variable:"e61096212b3a73267294192100f7c3b3" };
        helpers.renderMailTemplate(filename, params,function(err, response){
          assert.isNull(err);
          assert.include(response, "This is a paragraph");
          assert.include(response, params.variable);
          done();
        });

      });
    });

    describe('no template ', () => {
      it('returns an error', (done) =>  {

        let filename = "noTemplate";
        let params = { variable:"e61096212b3a73267294192100f7c3b3" };
        helpers.renderMailTemplate(filename, params, function(err, response){
          assert.isNotNull(err);
          done();
        });

      });
    });
  });

});
