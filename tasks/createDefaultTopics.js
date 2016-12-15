'use strict';

var topics = require('./createDefaultTopicsLogic.js');

topics.createDefaultTopics().then(function() {
  topics.createDefaultTopicsVideo().then(function() {
    process.exit();
  }, function(error){
    console.log(error);
    process.exit();
  });
}, function(error){
  console.log(error);
  process.exit();
});
