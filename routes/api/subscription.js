'use strict';

var _ = require('lodash');
var subscription = require('./../../services/subscription');

module.exports = {
  getPlans: getPlans
};

function getPlans(req, res, next) {
  subscription.getAllPlans().then(function(result) {
    res.send({subPlans: result});
  }, function(err) {
    res.send(({ error: err.message }));
  });
}
