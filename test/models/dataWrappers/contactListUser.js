"use strict";
var assert = require("chai").assert;
var ContactListUser  = require('./../../../models/dataWrappers').ContactListUser;

describe('Data Wrappers -> ContactListUser', () => {
  describe('new',  ()=>  {
    let defaultValue = ['firstName', 'lastName'];
    let customFields = ['mobile'];
    let data = {
      customFields: { mobile: "1234556" },
      User: {
        firstName: "Dainis",
      }
    }

    let instance = new ContactListUser(defaultValue, customFields, data);
    it('map fields', () =>  {
      assert.isDefined(instance.firstName);
      assert.equal(instance.lastName, null);
      assert.isDefined(instance.mobile);
      assert.isUndefined(instance.notExists);
    });

    it("assigne values", () =>{
      assert.equal(instance.firstName, data.User.firstName);
      assert.equal(instance.lastName, data.User.lastName);
      assert.equal(instance.mobile, data.customFields.mobile);
    });
  });
});
