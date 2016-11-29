'use strict'

const NR = require("node-resque")
const connectionDetails = require('../config/backgroudServer.js')
let Bluebird = require('bluebird')
var queue = null
const { sendInvite } = require('./invite.js')

const jobs = {
  "invite": {
    perform: (inviteId, callback) => {
      sendInvite(inviteId).then(() => {
        callback(null);
      });
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
        console.log("node-resque succsess");
        next()
      })
    }
}

const enqueue = (queueName, jobName, attrs) => {
  if (queue) {
    if (process.env.NODE_ENV != "test") {
      queue.enqueue(queueName, jobName, attrs);
    }
  } else {
    throw "Queue not connected, call 'setUpQueue' function to connect Queue"
  }
}

module.exports = {
  setUpQueue: setUpQueue,
  enqueue: enqueue,
  jobsList: jobs
}
