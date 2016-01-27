'use strict';

var sessionFixture = require('./../test/fixtures/session');
sessionFixture.createChat().then(function(result) {
  process.exit();
}, function(error) {
  console.log("Error: " + error);
  process.exit();
});
