'use strict';
let Bluebird = require('bluebird');
var enableTrigerForTabel = require('./enableTrigerForTabel.js');
var databaseMonitoringFunction = require('./databaseMonitoringFunction.js');

const tables = [
  {name: "session_topic_notify" , table: "SessionTopics"},
  {name: "session_notify" , table: "Sessions"},
  {name: "invite_notify" , table: "Invites"},
  {name: "session_members_notify" , table: "SessionMembers"}
]

databaseMonitoringFunction.ifFunctionExists("table_update_notify").then(function() {
  Bluebird.each(tables, (item) => {
    return enableTrigerForTabel.create(item.name, item.table);
  }).then(function(result) {
    console.log(result);
    process.exit();
  },function(error) {
    console.log(error);
    process.exit();
  });

}, function(error) {
  console.log(error);
  process.exit();
})
