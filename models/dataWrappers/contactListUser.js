"use strict";
var _ = require('lodash');

var ContactListUser = class ContactListUser {
  constructor(defaultFilels, customFilels, data) {
    this.defaultFilels = defaultFilels;
    this.customFilels = customFilels;
    this.data = data;
    this.mapFilels();
  }

  mapFilels() {
    this.assignValues(this.defaultFilels);
    this.assignValues(this.customFilels);
  }

  assignValues(fieldsList){
    _.map(fieldsList, (e) => {
      this[e] = this.findValueInData(e);
    })
  }

  findValueInData(value){
    return (this.data.User[value] || this.data.customFilels[value])
  }
}

module.exports = ContactListUser;
