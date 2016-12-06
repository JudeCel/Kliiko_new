'use strict'

const NR = require("node-resque");
const connectionDetails = require('../config/backgroudServer.js');
let Bluebird = require('bluebird');
var queue = null

const jobs = {
  "invite": {
    perform: (inviteId, callback) => {
      const { sendInvite, updateEmailStatus }  = require('./invite.js')
      try {
        sendInvite(inviteId).then(() => {
          updateEmailStatus(inviteId, "done").then(() => {
            callback(null);
          }, (error) => {
            callback(error);
          })
        }, (error) => {
          updateEmailStatus(inviteId, "failed").then(() => {
            callback(null);
          }, (error) => {
            callback(error);
          })
        }).catch(function(error) {
          updateEmailStatus(inviteId, "failed").then(() => {
            callback(error);
          }, (error) => {
            callback(error);
          })
        });
      } catch (error) {
        updateEmailStatus(inviteId, "failed").then(() => {
          callback(error);
        }, (error) => {
          callback(error);
        })
      }
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
