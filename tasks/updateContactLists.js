'use strict';

var contacLists = require('./updateContactListsLogic.js');

contacLists.updateContactListNames().then(function() {
  process.exit();
}, function(error){
  console.log(error);
  process.exit();
});
