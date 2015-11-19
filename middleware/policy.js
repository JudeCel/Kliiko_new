"use strict";
var _ = require('lodash');

var roles = [
  "admin", "accountManager", "facilitator", "observer", "participant"]
]

function authorized(req, res, next) {

}


function assignCurrentDomain(req, req, res, next) {
  req.currentDomain = {name: "", roles: []}
  next()
}

models.exports = {
  authorized: authorized
}
