'use strict';

const assert = require('assert');
const logic = require('./../../tasks/updateSubscriptionPlansLogic');

describe.only('Update Subscription Plans Logic', () => {

  it('private#assign', (done) => {
    const plan = { key1: 123, key2: 123 };
    const preference = { key1: 0 };

    const data = logic.private.assign(plan, preference);
    assert.deepEqual(data, { key1: preference.key1, key2: plan.key2 });
    done();
  });
});
