var assert = require('chai').assert;
var stringHelpers = require('../../util/stringHelpers.js')

describe('stringHelpers', () => {
  it('camel2Human ', (done) =>  {
    try {
      assert.equal("Test", stringHelpers.camel2Human("Test"));
      assert.equal("Test", stringHelpers.camel2Human("test"));
      assert.equal("Test Test", stringHelpers.camel2Human("TestTest"));
      assert.equal("Test Test", stringHelpers.camel2Human("testTest"));
      assert.equal("", stringHelpers.camel2Human(""));
      done();
    } catch(e) {
      done(e);
    }
  });
});
