"use strict";
 require('dotenv-extended').load({
     errorOnMissing: true
 });
 process.on("uncaughtException", () => {}) //Hoot fix, Need to replace with normal solution !!!

const pm2 = require('pm2');
const WebSocket = require('ws');
const si = require('systeminformation');
const Repo = require('./monitoring/repo');
const ErrorParser = require('./monitoring/errorParser');

const token = process.env.MONITORING_SERVER_TOKEN;
const url = process.env.MONITORING_SERVER_URL;
const projectName = process.env.MONITORING_SERVER_PROJECT_NAME;

const repo = new Repo(WebSocket, url, {type: "server"});

const infoChannel = repo.addChannel(`info:${projectName}`, {token});
const errorChannel = repo.addChannel(`error:${projectName}`, {token});

pm2.connect((err, resp) => { 
  setInterval(() => {
    pm2.Client.executeRemote('getMonitorData', {}, function(err, list) {
      let metrics = list.map((item) => { 
        return {monit: item.monit, name: item.name }
      });

      si.currentLoad().then((load) => {
        si.mem().then((mem) => {
          let date = new Date().toISOString();
          infoChannel.push("system_info_metrics", { load, mem, metrics, date});
        });
      });
    });
  }, 1000);
});

repo.connect();

process.on('message',  (data) => {
  if(data.type == 'error'){
    errorChannel.push("new_entry",  JSON.stringify(ErrorParser.parse(data.data)));
  }
});