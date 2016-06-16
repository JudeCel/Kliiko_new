require('dotenv-extended').load({
  errorOnMissing: true
});

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.TEST_ENV = process.env.TEST_ENV || 'test';

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST

var models = require("./models");
models.sequelize.sync({ force: true }).then(function() {
  console.log("TEST DB is restarted");
  process.exit();
});
