"use strict";
 require('dotenv-extended').load({
     errorOnMissing: true
 });
const pm2 = require('pm2');
const WebSocket = require('ws');
const Repo = require('./monitoring/repo');
const token = "a043793f-19ad-409e-bca1-b7c2774d34e9"
const repo = new Repo(WebSocket, process.env.MONITORING_SERVER_URL, {type: "server"});

const infoChannel = repo.addChannel("info:kliiko", {token});
const errorChannel = repo.addChannel("error:kliiko", {token});

pm2.connect((err, resp) => { 
  setInterval(() => {
    pm2.Client.executeRemote('getMonitorData', {}, function(err, list) {
      let data = list.map((item) => { 
        return {monit: item.monit, name: item.name }
      })
      infoChannel.push("system_metrics", { metrics: data })
    })
  }, 2000)
})

infoChannel.on("system_metrics", () => {
  infoChannel.push("system_metrics", { metrics: process.memoryUsage()})
})

repo.connect();

process.on('message', function (data) {
  if(data.type == 'error'){
    errorChannel.push("new_entry",  data.data)
  }
});