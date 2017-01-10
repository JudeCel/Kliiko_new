'use strict';
var inviteService = require('../../services/invite');

module.exports = {
  webhook: webhook
};

function webhook(req, res, next) {
  console.log(req, "mailgun.js:9");
  inviteService.processMailWebhook(req.body).then(() => {
    res.sendStatus(200);
  }, (error) => {
    console.log(error);
    res.sendStatus(500);
  });
}
