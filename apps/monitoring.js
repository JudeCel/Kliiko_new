"use strict";
const util = require('util');
const WebSocket = require('ws');
const Repo = require('./monitoring/repo');
const ws = new WebSocket(process.env.MONITORING_SERVER_URL);
const repo = new Repo(ws);

repo.addChannel("logger:nodeApp");
repo.addChannel("server-monitor:nodeApp");



process.on('message', function (data) {
   console.log(data);
  //  console.log('your actual data object', data.data);
});