require('dotenv-extended').load({
  errorOnMissing: true
});

process.env.TEST_ENV =  process.env.NODE_ENV;

var models = require("../models");
models.sequelize.sync({ force: true }).then(function() {
  console.log("TEST DB is restarted");
  process.exit();
});
