"use strict";
var models = require("./../../models");
var async = require('async');
var config = require('config');

// Redis

function clearRedisDB(callback) {
  let envConfig = config.get("redisSession");
  let host = envConfig['host'];
  let port = envConfig['port'];
  let dbNr = envConfig['db'];
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


function foreignKeyChecks(status, callback) {
  models.sequelize.query('SET FOREIGN_KEY_CHECKS = ' + status).then( () =>{
    callback(null);
  }).catch( (err) => {
    callback(err);
  });
}
function syncDB(callback) {
  models.sequelize.sync({ force: true }).then( () =>  {
    callback(null, 1);
  }).catch( (err) => {
    callback(err);
  });
}

function sequelizeSync(callback) {
  let sequelizeSyncFunctionList = [
    (cb) => { foreignKeyChecks(0, cb) },
    syncDB,
    foreignKeyChecks
  ];

  console.log("Start Sequelize Sync");
  async.waterfall(sequelizeSyncFunctionList, (error) => {
    console.log("DB is restarted");
    callback(error);
  });
}

databaseReset();
