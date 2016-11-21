'use strict';

const NR = require("node-resque");
 let Bluebird = require('bluebird');
var queue = null;

const connectionDetails = {
  host:      '127.0.0.1',
  password:  null,
  port:      6379,
  database:  parseInt(process.env.REDIS_DB),
  namespace: 'dashboard_jobs',
  looping: true,
};


function setUpQueue(config, jobs) {
  return new Bluebird((resolve, reject) => {
    if (queue) {
      resolve(queue)
    }else {
      let tmpQueue = new NR.queue({connection: config}, jobs);
      tmpQueue.connect(() => {
        tmpQueue.on('error', (error) => { console.log(error); });
        queue = tmpQueue
        resolve(queue)
      });
    }
  })
}

function getQueue() {
  if (queue) {
    return queue
  } else {
    throw "Queue not conected call 'setUpQueue' function "
  }
}

module.exports = {
  setUpQueue: setUpQueue,
  getQueue: getQueue
};
