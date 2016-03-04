'use strict';

var constants = require('../../util/constants');
var sessionBuilderServices = require('./../../services/sessionBuilder');
let topicsService = require('./../../services/topics');
let _ = require('lodash');

module.exports = {
  new: initializeBuilder,
  update: update,
  nextStep: nextStep,
  cancel: cancel,
  openBuild: openBuild,
  sendSms: sendSms,
  inviteMembers: inviteMembers,
  removeInvite: removeInvite,
  removeSessionMember: removeSessionMember,
  sendGenericEmail: sendGenericEmail,
  addTopics: addTopics
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
  //res.send({ok:' tmp'}); return
  /////////

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
  //res.send({ok:' tmp'}); return
  /////////

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

function sendSms(req, res, next) {
  sessionBuilderServices.sendSms(req.body).then(function(result) {
    res.send({ message: result });
  }, function(error) {
    res.send({ error: error });
  });
}

function inviteMembers(req, res, next) {
  sessionBuilderServices.inviteMembers(req.params.id, req.body).then(function(result) {
    res.send({ data: result, message: 'Successfully invited contacts' });
  }, function(error) {
    res.send({ error: error });
  });
}

function removeInvite(req, res, next) {
  sessionBuilderServices.removeInvite(req.params).then(function(message) {
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
  sessionBuilderServices.sendGenericEmail(req.params.id, req.body).then(function(message) {
    res.send({ message: message });
  }, function(error) {
    res.send({ error: error });
  });
}

function addTopics(req, res, next) {
  if (!req.body.topicsArray) { res.send({error:'Required body param @topicsArray is missed'}); return};


  topicsService.removeAllFromSession(req.params.id).then(function(result) {

    topicsService.updateSessionTopics(req.body.topicsArray, req.params.id).then(function(result2) {
      res.send(result2);
    }, function(error) {
      res.send({ error: error });
    });

  }, function(error) {
    res.send({ error: error });
  });


}
