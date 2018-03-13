let request = require('request');
let zapierSubscriptionService = require('./zapierSubscription');
let _ = require('lodash');

const HEADERS = { 'content-type': 'application/json' }
const UNSUBSCRIBE_STATUS_CODE = 410;

function notify(event) {
  zapierSubscriptionService.findAllByEvent(event).then((subscriptions) => { 
    notifyEachSubscriber(subscriptions);
  });
}

function notifyEachSubscriber(subscriptions) {
  _.forEach(subscriptions, (subscription) => {
    post(subscription);
  });
}

function post(subscription) {
  request.post({ headers: HEADERS, url: subscription.targetUrl }, (error, res, data) => {
    if (res && res.statusCode == UNSUBSCRIBE_STATUS_CODE) {
      zapierSubscriptionService.unsubscribe(subscription.id);
    }
  });
}

module.exports = {
  notify: notify
}