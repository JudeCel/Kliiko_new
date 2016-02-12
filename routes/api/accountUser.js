'use strict';

var q = require('q');
var accountUserServices = require('./../../services/accountUser');

function get(req, res, next) {
  accountUserServices.findWithSessionMembers(req.user.id, res.locals.currentDomain.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send(error);
  });
};

module.exports = {
  get: get
};
