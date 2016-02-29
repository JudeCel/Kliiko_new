'use strict';

var mailFixture = require('./../test/fixtures/mailTemplates');
mailFixture.createMailTemplate().then(function(result){
  process.exit();
});
