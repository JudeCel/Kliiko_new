'use strict';

var chargebeeWebhookService = require('./../../services/chargebeeWebhook');

module.exports = {
  endPoint: endPoint
};

function endPoint(req, res, next) {
  let eventType = req.body.event_type;
  let params = {
    subscriptionId: req.body.content.subscription.id,
    eventId: req.body.id
  }

  chargebeeWebhookService.select(eventType, params).then(function() {
    res.sendStatus(200);
  }, function() {
    res.sendStatus(500);
  });
}
