'use strict';

var accountUserServices = require('./../../services/accountUser');

function get(req, res, next) {
  if(!req.currentResources.account) {
    return res.send({ error: 'Not in account' });
  }
  res.send(req.currentResources.accountUser);
};

module.exports = {
  get: get
};
