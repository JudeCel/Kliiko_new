'use strict';

var accountServices = require('./../../services/account');
var policy = require('./../../middleware/policy.js');

function get(req, res, next) {
  if(!req.currentResources.account) {
    return res.send({ error: 'Not in account' });
  }

  accountServices.findWithSubscription(req.currentResources.account.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({ error: error });
  });
};

function createNewAccount(req, res, next) {
  let isAdmin = policy.hasAccess(req.currentResources.accountUser.role, ['admin']);
  accountServices.createNewAccountIfNotExists(req.body, req.currentResources.user.id, isAdmin).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({ error: error });
  });
};

module.exports = {
  get: get,
  createNewAccount: createNewAccount
};
