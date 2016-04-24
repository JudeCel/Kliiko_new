'use strict';

var accountServices = require('./../../services/account');

function get(req, res, next) {
  if(!res.locals.currentDomain) {
    return res.send({ error: 'Not in account' });
  }

  accountServices.findWithSubscription(res.locals.currentDomain.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({ error: error });
  });
};

module.exports = {
  get: get
};