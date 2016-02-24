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
  let params = { accountId: res.locals.currentDomain.id };
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
  res.send({ok:' tmp'}); return
  ///////

  if (!req.body.sessionObj) { res.send({error:' Required body param @sessionObj is missed'}); return;}

  let sessionObj = req.body.sessionObj;

  sessionObj.accountId = res.locals.currentDomain.id;
  delete sessionObj.step; // Step only can be updated with next step function

  sessionBuilderServices.update(sessionObj).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function nextStep(req, res, next) {
  res.send({ok:' tmp'}); return
  ///////

  if (!req.body.sessionObj) { res.send({error:' Required body param @sessionObj is missed'}); return;}

  let accountId = res.locals.currentDomain.id;
  let sessionObj = req.body.sessionObj;

  sessionBuilderServices.nextStep(sessionObj.id, accountId, sessionObj).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function cancel(req, res, next) {
  sessionBuilderServices.destroy(req.params.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}
