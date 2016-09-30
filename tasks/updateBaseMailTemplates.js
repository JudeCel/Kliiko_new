'use strict';

var updateBaseMailTemplatesLogic = require('./updateBaseMailTemplatesLogic.js');

updateBaseMailTemplatesLogic.doUpdate().then(function() {
  process.exit();
}, function(error){
  process.exit();
});
