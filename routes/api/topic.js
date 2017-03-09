'use strict';

let q = require('q');
let topicsService = require('./../../services/topics');
var MessagesUtil = require('./../../util/messages');
var topicConstants = require('./../../util/topicConstants');
var sessionBuilderServices = require('./../../services/sessionBuilder');
var policy = require('./../../middleware/policy.js')

module.exports = {
  get: getAll,
  post: post,
  deleteById: deleteById,
  updateById: updateById,
  updateSessionTopic: updateSessionTopic
};

function getAll(req, res, next) {
  let accountId = req.currentResources.account.id;
  topicsService.getAll(accountId, req.body.sessionType).then(
    function(result) { res.send({ topics: result, validations: topicConstants.validations })},
    function(error) { res.send({error:error})}
  );
}

function updateSessionTopic(req, res, next) {
  topicsService.updateSessionTopic(req.body).then(function(response) {
    if (response.sessionTopic) {
      let accountId = req.currentResources.account.id;
      let sessionId = response.sessionTopic.sessionId;
      sessionBuilderServices.sessionBuilderObjectStepSnapshot(sessionId, accountId, "facilitatiorAndTopics").then(function(snapshotResult) {
        res.send({data: response, snapshot: snapshotResult});
      }, function (error) {
        res.send({ error: error });
      });
    } else {
      res.send(response);
    }
  }, function(error) {
    res.send({ error: error });
  });
}

function post(req, res, next) {

  if (!req.body.topic) { res.send({error: '@topic body param is missed'}); return }

  let params = req.body.topic;
  params.accountId = req.currentResources.account.id;
  let isAdmin = policy.hasAccess(req.currentResources.accountUser.role, ['admin']);

  topicsService.create(params, isAdmin).then(
    function(response) { res.send({success: true, data:response, message: MessagesUtil.routes.topic.created })},
    function(error) { res.send({error:error})}
  );

}

function deleteById(req, res, next) {
  if (!req.params.id) {
    res.send({error: '@id param is missed'});
    return
  }
  let isAdmin = policy.hasAccess(req.currentResources.accountUser.role, ['admin']);

  topicsService.destroy(req.params.id, isAdmin).then(
    function(response) { res.send({success: true, data:response, message: MessagesUtil.routes.topic.removed })},
    function(error) { res.send({error:error})}
  );

}

function updateById(req, res) {
  if (!req.params.id) {
    res.send({error: '@id query param is missed'});
    return
  }

  let params = req.body.topic;
  params.accountId = req.currentResources.account.id;
  let isAdmin = policy.hasAccess(req.currentResources.accountUser.role, ['admin']);
  
  topicsService.update(params, isAdmin).then(
    function(response) { res.send({success: true, data:response, message: MessagesUtil.routes.topic.updated })},
    function(error) { res.send({error:error})}
  );
}
