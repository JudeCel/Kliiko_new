"use strict";
var assert = require("chai").assert;
var expect = require("chai").expect;
var helpers = require('./../../mailers/helpers.js');
var urlHeplers = require('./../../services/urlHeplers');

describe('Mailer helpers', () => {
  describe('getUrl ', () => {
    describe('success ', () => {
      it('call next Callback', () =>  {

        let token = "token";
        let path = "/somePath";
        let url = helpers.getUrl(token, null, path);
        assert.equal(url, urlHeplers.getBaseUrl() + path + token );

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
