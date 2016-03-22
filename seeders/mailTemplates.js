'use strict';
require('dotenv-extended').load({
  errorOnMissing: true
});

var mailFixture = require('./../test/fixtures/mailTemplates');
mailFixture.createMailTemplate().then(function(result){
  process.exit();
});
