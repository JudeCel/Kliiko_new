"use strict";
var _ = require('lodash');

var ContactListUser = class ContactListUser {
  constructor(defaultFields, customFields, participantsFields, visibleFields,  data) {
    this.defaultFields = defaultFields
    this.customFields = customFields;
    this.visibleFields = visibleFields;
    this.participantsFields = participantsFields;
    this.data = data;
    this.mapFields();
    this.assignId();
    this.assignParticipantsFields();
  }

  mapFields() {
    this.assignValues(this.defaultFields);
    this.assignValues(this.customFields);
  }

  assignParticipantsFields(){
    // TODO: Need make iterator This is only example
    this.inviteCount = 4;
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
    return (this.data.AccountUser[value] || this.data.customFields[value]);
  }
}

module.exports = ContactListUser;
