'use strict';

var chargebeeWebhookService = require('./../../services/chargebeeWebhook');

module.exports = {
  endPoint: endPoint
};

function endPoint(req, res, next) {
  chargebeeWebhookService.select(req.body).then(function() {
    res.sendStatus(200);
  }, function() {
    res.sendStatus(500);
  });
}
