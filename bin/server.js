"use strict";
const cluster = require('cluster');
/**
 * Module dependencies.
 */
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
        require("./micServices/www");
        break;
      case "backgroundWorkerServer":
        console.log("background Worker Server");
        require("./micServices/backgroundSideServer");
        break;
      default:
        console.log("Unhandled process role: " + process.env.ROLE);
    }
  }
