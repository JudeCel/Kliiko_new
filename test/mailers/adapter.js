"use strict";
var assert = require("chai").assert;
var { sendMail } = require('./../../mailers/adapter.js');

describe('sendMail ', () => {
  describe('success ', () => {
    it('creates a fake transport for testing', (done) =>  {
      let fakeData = { datum1: "aString", datum2: 2, datum3: { iAmAnObject: true } };
      sendMail(fakeData, function(err, response){
        assert.equal(response.data,fakeData);
        done();
      });
    });
  });
});
