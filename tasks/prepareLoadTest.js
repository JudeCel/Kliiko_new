'use strict';

var prepareLoadTestLogic = require('./prepareLoadTestLogic');

prepareLoadTestLogic.createUsers().then(function() {
  console.log("Users created");
  prepareLoadTestLogic.createSessions().then(function() {
    console.log("Sessions created");
    process.exit();
  }, function(error){
    console.log(error);
    process.exit();
  });
}, function(error){
  console.log(error);
  process.exit();
});
