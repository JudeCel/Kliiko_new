"use strict";
const NR = require("node-resque");
const connectionDetails = require('../config/backgroudServer.js');
const { setUpQueue, jobsList} = require('../services/backgroundQueue.js');

const multiWorker = new NR.multiWorker({
  connection: connectionDetails,
  queues: ['invites'],
  minTaskProcessors:   1,
  maxTaskProcessors:   10,
  checkTimeout:        1000,
  maxEventLoopDelay:   10,
  toDisconnectProcessors: true,
}, jobsList);

multiWorker.start(() => {
  console.log("Node.js Resque server is started.");
});
