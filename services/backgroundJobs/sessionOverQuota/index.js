'use strict'

const { sessionOverQuota } = require('../../sessionOverQuota.js');

function sendEmail(sessionId, inviteId, callback) {
  sessionOverQuota(sessionId, inviteId).then(() => {
    callback();
  }, (error) => {
    callback(error);
  });
}

module.exports = {
  sendEmail: sendEmail
}
