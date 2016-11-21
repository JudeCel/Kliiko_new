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

const setUpQueue = (_req, _res, next) => {
    if (queue) {
      next()
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
