"use strict";
var assert = require('assert');
var expect = require("chai").expect;
var config = require('config');
var helpers = require('./../../mailers/helpers.js');

var mailUrlPattern = "http://"+config.get('server')['domain']+":"+config.get('server')['port'];

describe('Mailer helpers', () => {
  describe('getUrl ', () => {
    describe('success ', () => {
      it('call next Callback', () =>  {
        let token = "token";
        let path = "/somePath";

        let url = helpers.getUrl(token, path);
        assert.equal(url, mailUrlPattern + path + token )
      });
    });
  });
});
