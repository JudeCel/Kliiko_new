'use strict';

var databaseMonitoringFunction = require('./databaseMonitoringFunction.js');

databaseMonitoringFunction.createTableChangeNotify().then(function() {
  console.log("Create Table Change Notify", "Done!");
  process.exit();
}, function(error){
  console.log(error);
  process.exit();
});
