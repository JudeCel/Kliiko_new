'use strict'

const NR = require("node-resque")
const connectionDetails = require('../config/backgroudServer.js')
let Bluebird = require('bluebird')
var queue = null

const jobs = {
  "invite": {
    perform: (inviteId, callback) => {
      console.log("invite id:", inviteId)
      callback(null)
    },
  },
}

const setUpQueue = (config) => {
  return new Bluebird((resolve, reject) => {
    if (queue) {
      resolve(queue)
    }else {
      let tmpQueue = new NR.queue({connection: config}, jobs)
      tmpQueue.connect(() => {
        tmpQueue.on('error', (error) => { console.log(error) })
        queue = tmpQueue
        resolve(queue)
      })
    }
  })
}

const getQueue = () =>  {
  if (queue) {
    return queue
  } else {
    throw "Queue not conected call 'setUpQueue' function "
  }
}

module.exports = {
  setUpQueue: setUpQueue,
  getQueue: getQueue,
  jobsList: jobs
}
