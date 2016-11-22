'use strict';

var models = require("../models");

var contactListUpdateValues = [
  { name: 'Hosts' },
  { name: 'Guests' },
  { name: 'Spectators' }
];
var contactListSelectors = [
  { where : { name: 'Facilitators' } },
  { where : { name: 'Participants' } },
  { where : { name: 'Observers' } }
];

for (var i = 0; i < contactListUpdateValues.length; i++) {
  models.ContactList.update(contactListUpdateValues[i], contactListSelectors[i]).then(function(){
    process.exit();
  }, function(error){
    console.log(error);
    process.exit();
  });
}
