'use strict'

const NR = require("node-resque");
const connectionDetails = require('../config/backgroudServer.js');
let Bluebird = require('bluebird');
let queue = null;
const invitesJobs = require('./backgroundJobs/invites/index.js');

const jobs = {
  "invite": {
    perform: (inviteId, callback) => {
      invitesJobs.sendInvite(inviteId, callback);
    },
  },
}

const setUpQueue = (_req, _res, next) => {
    if (queue) {
      next();
    }else {
      let tmpQueue = new NR.queue({connection: connectionDetails}, jobs)
      tmpQueue.connect(() => {
        tmpQueue.on('error', (error) => { console.log(error) })
        queue = tmpQueue
        console.log("node-resque successfully started");
        next();
      })
    }
}

const enqueue = (queueName, jobName, attrs) => {
  return new Bluebird((resolve, reject) => {
    if (queue) {
      if (process.env.NODE_ENV != "test") {
        resolve(queue.enqueue(queueName, jobName, attrs));
      }else{
        resolve();
      }
    } else {
      setUpQueue(null, null, () => {
        resolve();
      });
    }
  })
}

module.exports = {
  setUpQueue: setUpQueue,
  enqueue: enqueue,
  jobsList: jobs
}
