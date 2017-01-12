'use strict';

var accountUserServices = require('./../../services/accountUser');

function get(req, res, next) {
  if(!req.currentResources.account) {
    return res.send({ error: 'Not in account' });
  }

  accountUserServices.findWithSessionMembers(req.currentResources.user.id, req.currentResources.account.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({ error: error });
  });
};

module.exports = {
  get: get
};
