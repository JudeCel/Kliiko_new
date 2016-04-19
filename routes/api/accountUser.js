'use strict';

var accountUserServices = require('./../../services/accountUser');

function get(req, res, next) {
  if(!res.locals.currentDomain) {
    return res.send({ error: 'Not in account' });
  }

  accountUserServices.findWithSessionMembers(req.user.id, res.locals.currentDomain.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({ error: error });
  });
};

module.exports = {
  get: get
};
