'use strict';
var inviteService = require('../../services/invite');

module.exports = {
  webhook: webhook
};

function webhook(req, res, next) {
  console.log(req.params, "params");
  console.log(res.body, "body");
  inviteService.processMailWebhook(res.body).then(() => {
    res.sendStatus(200);
  }, (error) => {
    res.sendStatus(500);
  });
}
