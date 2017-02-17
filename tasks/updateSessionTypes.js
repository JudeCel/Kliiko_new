'use strict';

const sessionTypeService = require('./../services/sessionType.js');

sessionTypeService.updateSessionTypes().then(function() {
  process.exit();
}, function(error){
  process.exit();
});
