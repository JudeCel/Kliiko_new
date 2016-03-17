'use strict';

var _ = require('lodash');
var subscriptionAddon = require('./../../services/subscriptionAddon');

module.exports = {
  getPlans: getPlans
};

function getPlans(req, res, next) {
  subscriptionAddon.getList().then(function(result) {
    res.send({smsCreditList: result});
  }, function(err) {
    res.send(({ error: err.message }));
  });
}


function getList(req, res, next) {
  
}
