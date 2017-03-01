"use strict";
 require('dotenv-extended').load({
     errorOnMissing: true
 });

const WebSocket = require('ws');
const Repo = require('./monitoring/repo');
const repo = new Repo(WebSocket, process.env.MONITORING_SERVER_URL, {});

const infoChannel = repo.addChannel("info:kliiko");
const errorChannel = repo.addChannel("error:kliiko");

infoChannel.on("get_deps", () => {
    exec('yarn outdated --color', (error, stdout, stderr) => {
      if(error) {
        infoChannel.push("deps", {status: 'error', data: error})
      } else {
        infoChannel.push("deps", { status: 'ok', data: stdout })
      }
    });
})

infoChannel.on("ping", () => {
  infoChannel.push("pong", { status: 'ok'})
})

infoChannel.on("system_metrics", () => {
  infoChannel.push("system_metrics", { metrics: process.memoryUsage()})
})

process.on('message', function (data) {
  // errorChannel
  // logsChannel
  //  console.log('your actual data object', data.data);
});