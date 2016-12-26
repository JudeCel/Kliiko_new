'use strict'

function sendInvite(inviteId, callback) {
  const { sendInvite, processEmailStatus }  = require('../../invite.js');
  sendInvite(inviteId).then((resp) => {
    // resp =>
  //   { accepted: [ 'dainis186+4@gmail.com' ],
  //     rejected: [],
  //     response: '250 Great success',
  //     envelope: {
  //      from: 'postmaster@noreply.klzii.com',
  //      to: [ 'dainis186+4@gmail.com' ]
  //     },
  //    messageId: '7fd443ff-d8a0-6fa0-ee5f-726935200fce@noreply.klzii.com' }

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
