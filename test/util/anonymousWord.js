var assert = require('chai').assert;
var anonymousWord = require('../../util/anonymousWord.js')

describe('Anonymous Words', () => {
  describe('#parseFile', () => {
    it('get all names 232', (done) =>  {
      anonymousWord.parseFile().then((result) => {
        try {
          assert.equal(result.length, 232);
          done();
        } catch (e) {
          done(e);
        }
      }, function(error) {
        done(error);
      })
    })
  })

  describe('#getWord', () => {
    it('get single word', (done) =>  {
      anonymousWord.getWord(["name"], ["pff", "fuu"]).then((result) => {
        try {
          assert.notEqual(result, "name");
          done();
        } catch (e) {
          done(e);
        }
      }, function(error) {
        done(error);
      })
    })

    it('get word with number', (done) =>  {
      anonymousWord.getWord(["name"], ["name"]).then((result) => {
        try {
          assert.notEqual(result, "name");
          assert.equal(result, "name#1");
          done();
        } catch (e) {
          done(e);
        }
      }, function(error) {
        done(error);
      })
    })

    it('get word with higher level number', (done) =>  {
      anonymousWord.getWord(["name", "name#1"], ["name"]).then((result) => {
        try {
          assert.notEqual(result, "name");
          assert.notEqual(result, "name#1");
          assert.equal(result, "name#2");
          done();
        } catch (e) {
          done(e);
        }
      }, function(error) {
        done(error);
      })
    })

    it('get word of a lower level name', (done) =>  {
      anonymousWord.getWord(["name#1", "name#2"], ["name"]).then((result) => {
        try {
          assert.notEqual(result, "name#1");
          assert.notEqual(result, "name#2");
          done();
        } catch (e) {
          done(e);
        }
      }, function(error) {
        done(error);
      })
    })
  })
})
