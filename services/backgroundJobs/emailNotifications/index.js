'use strict'

const { sendNotification } = require('../../emailNotification.js');

function sendNotificationFunc(accountUserId, sessionId, callback) {
  sendNotification(accountUserId, sessionId).then(() => {
    callback();
  }, (error) => {
    callback(error);
  });
}

module.exports = {
  sendNotification: sendNotificationFunc
}
