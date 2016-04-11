"use strict";
require('dotenv-extended').load({
  errorOnMissing: true
});
var productionEnvMapper = require("../../util/productionEnvMapper")

// Maps Kubernetes specific values to Local values
productionEnvMapper.map();

var models = require("./../../models");
var async = require('async');

// Redis

function clearRedisDB(callback) {
  let host = process.env.REDIS_HOST;
  let port = process.env.REDIS_PORT;
  let dbNr = process.env.REDIS_DB;
  var redisClient = require('redis').createClient(port, host);

  console.log("Start Redis DB clean up");
  redisClient.select(dbNr, () => {} );
  console.log("Selected db " + dbNr);

  redisClient.keys("sess:*", (err, key) => {
    if (key.length > 0) {
      redisClient.del(key, (err) =>{
        console.log("End Redis DB clean up");
        callback(err);
      });
    }else {
      console.log("End Redis DB clean up");
      callback(null)
    }
  });
}
// Sequelize

function databaseReset() {
  let databaseResetFunctionList = [
    (cb) =>  { clearRedisDB(cb) },
    sequelizeSync
  ]

  async.waterfall(databaseResetFunctionList, (error) =>{
    if (error) { throw error }
    process.exit();
  });
}

function sequelizeSync(callback) {
  console.log("Start Sequelize Sync");
  models.sequelize.sync({ force: true }).then(() =>  {
    console.log("DB is restarted");
    callback(null);
  }).catch( (err) => {
    callback(err);
  });
}
databaseReset();
