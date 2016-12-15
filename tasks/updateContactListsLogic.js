'use strict';

var models = require("../models");
let Bluebird = require('bluebird');

var contactListUpdateValues = [
  { name: 'Hosts', where: { name: 'Facilitators'} },
  { name: 'Guests',  where : { name: 'Participants' } },
  { name: 'Spectators', where : { name: 'Observers' } }
];

var contactListUpdateFields = [
  { from: 'Confirmation', to: 'Accept' },
  { from: 'Comment', to: 'Comments' }
];


function updateContactListNames() {
  return new Bluebird(function (resolve, reject) {
    Bluebird.each(contactListUpdateValues, (item) => {
        return new Bluebird(function (resolve, reject) {
           models.ContactList.update({ name : item.name }, { where: item.where }).then(() =>{
            resolve();
          });
        });
    }).then(function() {
      resolve();
    }, function(error) {
      reject(error);
    });
  });
}

function updateContactListFields() {
  return new Bluebird(function (resolve, reject) {
    models.ContactList.findAll().then(function(results) {
      Bluebird.each(results, (item) => {
        let visibleFields = item.visibleFields;
        let participantsFields = item.participantsFields;
        contactListUpdateFields.forEach(function(field) {
          let pos1 = visibleFields.indexOf(field.from);
          if (pos1 >= 0) {
            visibleFields[pos1] = field.to;
          }
          let pos2 = participantsFields.indexOf(field.from);
          if (pos2 >= 0) {
            participantsFields[pos2] = field.to;
          }
        });
        return new Bluebird(function (resolve, reject) {
           models.ContactList.update({ visibleFields: visibleFields, participantsFields: participantsFields }, { where: {id: item.id} }).then(() =>{
            resolve();
          });
        });
      }).then(function() {
        resolve();
      }, function(error) {
        reject(error);
      });
    }, function(error) {
      reject(error);
    });
  });
}

module.exports = {
  updateContactListNames: updateContactListNames,
  updateContactListFields: updateContactListFields
}
