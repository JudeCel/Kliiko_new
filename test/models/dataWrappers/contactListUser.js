"use strict";
var assert = require("chai").assert;
var ContactListUser  = require('./../../../models/dataWrappers').ContactListUser;

describe('Data Wrappers -> ContactListUser', () => {
  describe('new',  ()=>  {
    let defaultValue = ['firstName', 'lastName'];
    let visibleFields = ['id', 'lastName'];
    let participantsFields = ['Invites'];
    let customFields = ['mobile'];
    let data = {
      id: 2,
      customFields: { mobile: "1234556" },
      AccountUser: {
        Invites: 4,
        firstName: "Dainis",
      }
    }

    let instance = new ContactListUser(defaultValue, customFields, participantsFields, visibleFields, data);
    it('map fields', () =>  {
      assert.isDefined(instance.firstName);
      assert.equal(instance.lastName, null);
      assert.isDefined(instance.mobile);
      assert.isUndefined(instance.notExists);
    });

    it("assigne values", () =>{
      assert.equal(instance.firstName, data.AccountUser.firstName);
      assert.equal(instance.Invites,  data.AccountUser.Invites);
      assert.equal(instance.lastName, data.AccountUser.lastName);
      assert.equal(instance.mobile, data.customFields.mobile);
      assert.equal(instance.id, data.id);
    });
  });
});
