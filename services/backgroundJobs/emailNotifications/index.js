'use strict'

function sendNotification(accountUserId, sessionId, callback) {
  const { sendNotification }  = require('../../emailNotification.js');

  sendNotification(accountUserId, sessionId).then(() => {
    callback();
  }, (error) => {
    callback(error);
  }).catch(function(error) {
    callback(error);
  });

}

module.exports = {
  sendNotification: sendNotification
}
