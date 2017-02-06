'use strict'

function sendNotification(sessionMemberId, callback) {
  console.log("!!!! Test sendNotification", sessionMemberId);
  callback();
}

module.exports = {
  sendNotification: sendNotification
}
