"use strict";
/**
This file for only for development to run all mic services in one time, not use with pm2!
*/
const cluster = require('cluster');
 require('dotenv-extended').load({
     errorOnMissing: true
 });

  if (cluster.isMaster) {
    cluster.fork({ROLE: "webServer"});
    cluster.fork({ROLE: "backgroundWorkerServer"});

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    switch (process.env.ROLE) {
      case "webServer":
        console.log("start web server");
        try {
          require("../apps/webServer.js");
        } catch (e) {
          console.log(e);
        }
        break;
      case "backgroundWorkerServer":
        console.log("background Worker Server");
        try {
          require("../apps/backgroundSideServer.js");
        } catch (e) {
          console.log(e);
        }
        break;
      default:
        console.log("Unhandled process role: " + process.env.ROLE);
    }
  }
