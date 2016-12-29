'use strict';
var inviteService = require('../../services/invite');

module.exports = {
  webhook: webhook
};

function webhook(req, res, next) {
  inviteService.processMailWebhook(res.params).then(() => {
    res.sendStatus(200);
  }, (error) => {
    res.sendStatus(error.code);
  });
}
