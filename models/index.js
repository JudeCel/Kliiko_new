'use strict';
// pg-native workaround
var pg = require('pg');
delete pg.native;

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
const TransactionPool = require('../lib/transactionPool');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var db        = {};
var config    = require(__dirname + '/../config/config.js')[env];


var sequelize = new Sequelize(config.database, config.username, config.password, config);

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    if (file.slice(-3) !== '.js') return;
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.sequelize.transactionPool = new TransactionPool();

db.Sequelize = Sequelize;

module.exports = db;
