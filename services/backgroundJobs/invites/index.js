'use strict'

function sendInvite(inviteId, callback) {
  const { sendInvite, updateEmailStatus }  = require('../../invite.js');
  sendInvite(inviteId).then(() => {
    updateEmailStatus(inviteId, "sent").then(() => {
      callback();
    }, (error) => {
      callback(error);
    })
  }, (error) => {
    updateEmailStatus(inviteId, "failed").then(() => {
      callback(error);
    }, (error) => {
      callback(error);
    });
  }).catch(function(error) {
    updateEmailStatus(inviteId, "failed").then(() => {
      callback(error);
    }, (error) => {
      callback(error);
    });
  });
}

module.exports = {
  sendInvite: sendInvite
}
