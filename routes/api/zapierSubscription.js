'use strict';

let zapierSubscriptionService = require('./../../services/zapierSubscription');
let constants = require('../../util/constants');

function subscribe(req, res, next) {
  zapierSubscriptionService.subscribe(req.body.event, req.body.targetUrl, req.currentResources.account.id)
  .then((subscription) => {
    res.send({ subscription: subscription })
  }, (error) => {
    if (error) {
      res.status(400).send({error: error});
    }

    res.status(500).send();
  });
}

function unsubscribe(req, res, next) {
  zapierSubscriptionService.unsubscribe(req.params.id).then((result) => {
    res.send();
  }, (error) => {
    if (error == constants.zapierSubscriptionNotFoundError) {
      res.status(404).send({error: error});
    } 

    res.status(500).send();
  });
}

module.exports = {
  subscribe: subscribe,
  unsubscribe: unsubscribe
};