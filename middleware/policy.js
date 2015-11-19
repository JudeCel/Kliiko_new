"use strict";
var _ = require('lodash');

function authorized(allowedRoles, req, res, nextCallback, faildeCallback) {
  let roles = req.currentDomain.roles
  let result = _.intersection(allowedRoles, roles)

  if (result.length > 0) { return nextCallback() }
  if (faildeCallback) { faildeCallback() }

  res.status(404).send('Access Denain!!!!');
}

module.exports = {
  authorized: authorized
}
