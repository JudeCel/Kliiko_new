'use strict';

var constants = require('../../util/constants');
var sessionBuilderServices = require('./../../services/sessionBuilder');
let topicsService = require('./../../services/topics');
let _ = require('lodash');

module.exports = {
  new: initializeBuilder,
  update: update,
  nextStep: nextStep,
  prevStep: prevStep,
  cancel: cancel,
  openBuild: openBuild,
  sendSms: sendSms,
  inviteMembers: inviteMembers,
  removeInvite: removeInvite,
  removeSessionMember: removeSessionMember,
  sendGenericEmail: sendGenericEmail,
  addTopics: addTopics,
  removeTopic: removeTopic,
  sessionMailTemplateStatus: sessionMailTemplateStatus,
  canAddObservers: canAddObservers
};

function initializeBuilder(req, res, next) {
  let params = { accountId: res.locals.currentDomain.id };
  sessionBuilderServices.initializeBuilder(params).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function canAddObservers(req, res, next) {
  sessionBuilderServices.canAddObservers(res.locals.currentDomain.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  });
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
  let sessionId = req.params.id;
  let sessionDataObj = req.body;
  sessionBuilderServices.update(sessionId, res.locals.currentDomain.id, sessionDataObj).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  });
}

function sessionMailTemplateStatus(req, res, next) {
  let sessionId = req.params.id;
  sessionBuilderServices.sessionMailTemplateStatus(sessionId, res.locals.currentDomain.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  });
}

function nextStep(req, res, next) {
  let accountId = res.locals.currentDomain.id;

  sessionBuilderServices.nextStep(req.params.id, accountId).then(function(result) {
    res.send({ data: result });
  }, function(error) {
    res.send({error: error});
  })
}

function prevStep(req, res, next) {
  let accountId = res.locals.currentDomain.id;

  sessionBuilderServices.prevStep(req.params.id, accountId).then(function(result) {
    res.send({ data: result });
  }, function(error) {
    res.send({error: error});
  });
}

function cancel(req, res, next) {
  sessionBuilderServices.destroy(req.params.id).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}

function sendSms(req, res, next) {
  sessionBuilderServices.sendSms(req.body).then(function(result) {
    res.send({ message: result });
  }, function(error) {
    res.send({ error: error });
  });
}

function inviteMembers(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  let accountName = res.locals.currentDomain.name;
  sessionBuilderServices.inviteMembers(req.params.id, req.body, accountId, accountName).then(function(result) {
    res.send({ data: result, message: 'Successfully invited contacts' });
  }, function(error) {
    res.send({ error: error });
  });
}

function removeInvite(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  sessionBuilderServices.removeInvite(req.params, accountId).then(function(message) {
    res.send({ message: message });
  }, function(error) {
    res.send({ error: error });
  });
}

function removeSessionMember(req, res, next) {
  sessionBuilderServices.removeSessionMember(req.params).then(function(message) {
    res.send({ message: message });
  }, function(error) {
    res.send({ error: error });
  });
}

function sendGenericEmail(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  sessionBuilderServices.sendGenericEmail(req.params.id, req.body, accountId).then(function(message) {
    res.send({ message: message });
  }, function(error) {
    res.send({ error: error });
  });
}

function addTopics(req, res, next) {
  let topics = req.body.topicsArray;
  if(!topics) { res.send({error:'Required body param @topicsArray is missed'}); return };


  topicsService.removeAllAndAddNew(req.params.id, req.body.topicsArray).then(function(result) {
    res.send({succuss:true, data:result});
  }, function(error) {
    res.send({ error: error });
  });
}

function removeTopic(req, res, next) {
  let topicId = req.body.topicId;
  var ids = [topicId];
  topicsService.removeFromSession(ids, req.params.id).then(function(result) {
    res.send({succuss:true, data:result});
  }, function(error) {
    res.send({ error: error });
  });
}
