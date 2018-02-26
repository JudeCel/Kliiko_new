require('dotenv-extended').load({
  errorOnMissing: true
});

process.env.TEST_ENV =  process.env.NODE_ENV;

var testDatabase = require("../test/database");

testDatabase.prepareDatabaseForTests().then(function() {
  console.log("TEST DB is restarted");
  process.exit();
});
