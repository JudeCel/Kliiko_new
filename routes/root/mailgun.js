'use strict';

const models =  require('./../models');

const { Invite } = models;
module.exports = {
  webhook: webhook
};

function webhook(req, res, next) {
  let mailMessageId = res.params["Message-Id"].replace(/[<>]/g, "");
  let emailStatus = null;
  
  if (res.params.event == "dropped") {
    emailStatus = "failed";
  }
  if (res.params.event == "dropped") {
    emailStatus = "sent";
  }

  Invite.update({emailStatus: emailStatus }, {where: {mailMessageId: mailMessageId}}).then(() => {
    res.sendStatus(200);
  });
}
