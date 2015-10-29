var models = require("./../../models");

models.sequelize.sync({ force: true }).then(function () {
  console.log("Start");
  // TODO: Need add seeds
  console.log("DB is restarted");
  process.exit();
});
