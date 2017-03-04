"use strict";
 require('dotenv-extended').load({
     errorOnMissing: true
 });
const pm2 = require('pm2');
const WebSocket = require('ws');
const si = require('systeminformation');
const Repo = require('./monitoring/repo');

const token =process.env.MONITORING_SERVER_TOKEN;
const url = process.env.MONITORING_SERVER_URL;
const projectName = process.env.MONITORING_SERVER_PROJECT_NAME;

const repo = new Repo(WebSocket, url, {type: "server"});

const infoChannel = repo.addChannel(`info:${projectName}`, {token});
const errorChannel = repo.addChannel(`error:${projectName}`, {token});

pm2.connect((err, resp) => { 
  setInterval(() => {
    pm2.Client.executeRemote('getMonitorData', {}, function(err, list) {
      let data = list.map((item) => { 
        return {monit: item.monit, name: item.name }
      })
      infoChannel.push("system_metrics", { metrics: data })
    })
  }, 5000)
})

infoChannel.on("system_info", () => {
  si.currentLoad().then((data) => {
    si.mem().then((mem) => {
      infoChannel.push("system_info", { load: data, mem: mem});
    })
  })
})

repo.connect();

process.on('message', function (data) {
  if(data.type == 'error'){
    errorChannel.push("new_entry",  data.data)
  }
});