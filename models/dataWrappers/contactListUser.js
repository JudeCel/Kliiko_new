"use strict";
var _ = require('lodash');

var ContactListUser = class ContactListUser {
  constructor(defaultFields, customFields, participantsFields, visibleFields, data) {
    this.mapFields(defaultFields, customFields, participantsFields, data);
    this.assignIds(data);
    this.setCanInvite(data);
  }

  mapFields(defaultFields, customFields, participantsFields, data) {
    this.assignValues(defaultFields, data);
    this.assignValues(customFields, data);
    this.stubParticipantsFields(participantsFields, data)
  }

  stubParticipantsFields(participantsFields, data) {
    let info = data.AccountUser.invitesInfo;
    _.map(participantsFields, (e) =>  {
      if (e != "Comments") {
        this[e] = info[e] || 0;
      }
    });
  }

  setCanInvite(data) {
    let info = data.AccountUser.invitesInfo;
    this["canInvite"] = !info["NotAtAll"] && !info["NoInFuture"];
  }

  assignIds(data){
    this.id = data.id;
    this.accountUserId = data.accountUserId;
  }

  assignValues(fieldsList, data){
    _.map(fieldsList, (e) => {
      this[e] = this.findValueInData(e, data);
    });
  }

  findValueInData(value, data){
    if (data.AccountUser) {
      return (data.AccountUser[value] || data.customFields[value]);
    } else {
      return data.customFields[value]
    }
  }
};

module.exports = ContactListUser;
