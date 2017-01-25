'use strict';

var accountUserServices = require('./../../services/accountUser');

function get(req, res, next) {
  if(!req.currentResources.account) {
    return res.send({ error: 'Not in account' });
  }
  res.send(req.currentResources.accountUser)
  // console.log(req.currentResources)
  // accountUserServices.systemInfo(req.currentResources.user.id, req.currentResources.account.id).then(function(result) {
  //   res.send(result);
  // }, function(error) {
  //   res.send({ error: error });
  // });
};

module.exports = {
  get: get
};
