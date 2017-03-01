'use strict';

var prepareLoadTestLogic = require('./prepareLoadTestLogic');

prepareLoadTestLogic.createUsers().then(() => {
  console.log("Users created");
  return prepareLoadTestLogic.createSessions();
}).then(() => {
  console.log("Sessions created");
  return prepareLoadTestLogic.populateContactLists();
}).then(() => {
  console.log("Contact lists populated");
  process.exit();
}).catch(function(error) {
  console.log(error);
  process.exit();
});