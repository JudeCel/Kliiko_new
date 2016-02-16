'use strict';

var constants = require('../../util/constants');
var sessionBuilderServices = require('./../../services/sessionBuilder');

module.exports = {
  new: initializeBuilder,
  update: update,
  nextStep: nextStep,
  cancel: cancel
};

function initializeBuilder(req, res, next) {
  let params = { accountId: res.locals.currentDomain.id }
  sessionBuilderServices.initializeBuilder(params).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function update(req, res, next) {
  params.accountId = res.locals.currentDomain.id;
  sessionBuilderServices.update(params).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}
function nextStep(req, res, next) {

}
function cancel(req, res, next) {
  sessionBuilderServices.cancel(req.params.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}
