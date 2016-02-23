'use strict';

var constants = require('../../util/constants');
var sessionBuilderServices = require('./../../services/sessionBuilder');

module.exports = {
  new: initializeBuilder,
  update: update,
  nextStep: nextStep,
  cancel: cancel,
  openBuild: openBuild
};

function initializeBuilder(req, res, next) {
  let params = { accountId: res.locals.currentDomain.id }
  sessionBuilderServices.initializeBuilder(params).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function openBuild(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  sessionBuilderServices.openBuild(req.params.id, accountId).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function update(req, res, next) {
  params.accountId = res.locals.currentDomain.id;
  delete params.step // Step only can be updated with next step function

  sessionBuilderServices.update(params).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function nextStep(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  sessionBuilderServices.nextStep(req.params.id, accountId, req.params).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function cancel(req, res, next) {
  sessionBuilderServices.cancel(req.params.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}
