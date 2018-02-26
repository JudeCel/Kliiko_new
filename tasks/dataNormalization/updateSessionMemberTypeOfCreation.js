'use strict';

var {updateTypeOfCreation} = require('./sessionMembers.js');

updateTypeOfCreation().then(function() {
  console.log("Data Normalization - update Session Member typeOfCreation : done");
  process.exit();
}, function(error){
  console.log(error);
  process.exit();
});
