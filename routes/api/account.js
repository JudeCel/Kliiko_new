'use strict';

var q = require('q');
var accountServices = require('./../../services/account');

function get(req, res, next) {
  accountServices.findWithSubscription(res.locals.currentDomain.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send(error);
  });
};

module.exports = {
  get: get
};
