'use strict'

function sendInvite(inviteId, callback) {
  const { sendInvite, processEmailStatus }  = require('../../invite.js');
  
  sendInvite(inviteId).then((resp) => {
    processEmailStatus(inviteId, resp).then(() => {
      callback();
    }, (error) => {
      callback(error);
    })
  }, (error) => {
    processEmailStatus(inviteId, null, "failed").then(() => {
      callback(error);
    }, (error) => {
      callback(error);
    });
  }).catch(function(error) {
    processEmailStatus(inviteId, null, "failed").then(() => {
      callback(error);
    }, (error) => {
      callback(error);
    });
  });
}

module.exports = {
  sendInvite: sendInvite
}
