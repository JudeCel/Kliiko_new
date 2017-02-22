"use strict";
const util = require('util');
const WebSocket = require('ws'););
const { MonitoringRepo } = require('./monitoring/repo');
const ws = new WebSocket(process.env.MONITORING_SERVER_URL);
const repo = new MonitoringRepo(ws);

repo.addChannel("logger:nodeApp");
repo.addChannel("server-monitor:nodeApp");



process.on('message', function (data) {
   console.log(data);
  //  console.log('your actual data object', data.data);
});