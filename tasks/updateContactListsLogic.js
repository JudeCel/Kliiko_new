'use strict';

var models = require("../models");
let Bluebird = require('bluebird');

var contactListUpdateValues = [
  { name: 'Hosts', where: { name: 'Facilitators'} },
  { name: 'Guests',  where : { name: 'Participants' } },
  { name: 'Spectators', where : { name: 'Observers' } }
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

module.exports = {
  updateContactListNames: updateContactListNames
}
