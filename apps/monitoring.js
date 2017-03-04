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

// TODO need refactor and make more consistent
pm2.connect((err, resp) => { 
  setInterval(() => {
    pm2.Client.executeRemote('getMonitorData', {}, function(err, list) {
      let metrics = list.map((item) => { 
        return {monit: item.monit, name: item.name }
      });

      si.currentLoad().then((load) => {
        si.mem().then((mem) => {
          infoChannel.push("system_info", { load, mem});
          infoChannel.push("system_metrics", { metrics });
        });
      });
    });
  }, 5000);
});

repo.connect();

process.on('message', function (data) {
  if(data.type == 'error'){
    errorChannel.push("new_entry",  data.data)
  }
});