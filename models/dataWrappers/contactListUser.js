"use strict";
var _ = require('lodash');

var ContactListUser = class ContactListUser {
  constructor(defaultFields, customFields, data) {
    this.defaultFields = defaultFields
    this.customFields = customFields;
    this.data = data;
    this.mapFields();
    this.assignId()
  }

  mapFields() {
    this.assignValues(this.defaultFields);
    this.assignValues(this.customFields);
  }

  assignId(){
    this.id = this.data.id;
  }
  assignValues(fieldsList){
    _.map(fieldsList, (e) => {
      this[e] = this.findValueInData(e);
    });
  }

  findValueInData(value){
    return (this.data.User[value] || this.data.customFields[value]);
  }
}

module.exports = ContactListUser;
