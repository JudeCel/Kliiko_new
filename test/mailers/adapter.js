"use strict";
var assert = require("chai").assert;
var { sendMail } = require('./../../mailers/adapter.js');

describe('sendMail ', () => {
  describe('success ', () => {
    it('creates a fake transport for testing', (done) =>  {
      let fakeData = { 
        to: "to@gmail.com", 
        from: "from@gmail.com", 
        html: ""
      };
      sendMail(fakeData).then((response) => {
        try {
          assert.equal(response.accepted[0], fakeData.to);
          assert.equal(response.envelope.from, fakeData.from);
          done();
        } catch (e) {
          done(e);
        }
      }, (error) => {
        done(error);
      })
    });
  });
});
