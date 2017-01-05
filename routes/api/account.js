'use strict';

var accountServices = require('./../../services/account');

function get(req, res, next) {
  if(!res.currentResources.account) {
    return res.send({ error: 'Not in account' });
  }

  accountServices.findWithSubscription(res.currentResources.account.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({ error: error });
  });
};

function createNewAccount(req, res, next) {
  accountServices.createNewAccountIfNotExists(req.body, res.currentResources.user.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({ error: error });
  });
};

module.exports = {
  get: get,
  createNewAccount: createNewAccount
};
