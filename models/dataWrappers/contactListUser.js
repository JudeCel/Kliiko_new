"use strict";
var _ = require('lodash');

var ContactListUser = class ContactListUser {
  constructor(defaultFilels, customFilels, data) {
    this.defaultFilels = defaultFilels;
    this.customFilels = customFilels;
    this.data = data;
    this.sortData();
  }

  sortData() {
    this.mapFilels(this.defaultFilels);
    this.mapFilels(this.customFilels);
  }

  mapFilels(fieldsList){
    _.map(fieldsList, (e) => {
      this[e] = this.findValueInData(e);
    })
  }

  findValueInData(value){
    return (this.data.User[value] || this.data.customFilels[value])
  }
}

module.exports = ContactListUser;
