"use strict";
var _ = require('lodash');

var ContactListUser = class ContactListUser {
  constructor(defaultFields, customFields, participantsFields, visibleFields,  data) {
    this.mapFields(defaultFields, customFields, participantsFields, data);
    this.assignId(data);
  }

  mapFields(defaultFields, customFields, participantsFields, data) {
    this.assignValues(defaultFields, data);
    this.assignValues(customFields, data);
    this.assignValues(participantsFields, data)
  }

  assignId(data){
    this.id = data.id;
  }
  assignValues(fieldsList, data){
    _.map(fieldsList, (e) => {
      this[e] = this.findValueInData(e, data);
    });
  }

  findValueInData(value, data){
    if (data.AccountUser) {
      return (data.AccountUser[value] || data.customFields[value]);
    }else {
      return data.customFields[value]
    }
  }
}

module.exports = ContactListUser;
