'use strict';

var accountUsers = require('./accountUsers.js');

accountUsers.updateAccountUsersUserId().then(function() {
  console.log("Data Normalization - AccountUsersUserId : done");
  process.exit();
}, function(error){
  console.log(error);
  process.exit();
});
