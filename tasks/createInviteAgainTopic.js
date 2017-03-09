'use strict';

var topics = require('./createDefaultTopicsLogic.js');

topics.createInviteAgainTopic().then(function() {
  process.exit();
}, function(error){
  console.log(error);
  process.exit();
});
