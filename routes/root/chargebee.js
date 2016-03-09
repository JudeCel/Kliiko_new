'use strict';

var subscriptionService = require('./../../services/subscription');

function subCancelled(req, res, next) {
  let subscription = req.body.content.subscription;

  subscriptionService.cancelSubscription(subscription.id, req.body.id).then(function() {
    res.sendStatus(200);
  }, function(error) {
    res.sendStatus(500);
  });
};

module.exports = {
  subCancelled: subCancelled
};
