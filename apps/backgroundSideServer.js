"use strict";
const NR = require("node-resque");
const _ = require('lodash')
const connectionDetails = require('../config/backgroudServer.js');
const {jobsList} = require('../services/backgroundQueue.js');
const backgroundQueues = require('../util/backgroundQueue');

const multiWorker = new NR.multiWorker({
  connection: connectionDetails,
  queues: _.values(backgroundQueues.queues),
  minTaskProcessors:   1,
  maxTaskProcessors:   10,
  checkTimeout:        1000,
  maxEventLoopDelay:   10,
  toDisconnectProcessors: true,
}, jobsList);

multiWorker.start(() => {
  console.log("Node.js Resque server is started.");
});
