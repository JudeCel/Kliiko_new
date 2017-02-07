'use strict'

function sendNotification(accountUserId, sessionId, callback) {
  const { sendNotification }  = require('../../emailNotification.js');

  //todo: uncomment and remove below
  /*sendNotification(accountUserId, sessionId).then(() => {
    callback();
  }, (error) => {
    callback(error);
  }).catch(function(error) {
    callback(error);
  });*/

  console.log("!!!! Test sendNotification", accountUserId, sessionId);
  callback();
}

module.exports = {
  sendNotification: sendNotification
}
