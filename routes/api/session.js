'use strict';

var constants = require('../../util/constants');
var sessionServices = require('./../../services/session');

module.exports = {
  get: get,
  remove: remove,
  copy: copy,
  updateRating: updateRating,
  getAllSessionRatings: getAllSessionRatings,
  getSessionByInvite: getSessionByInvite
};


function get(req, res, next) {
  sessionServices.findAllSessions(req.user.id, res.locals.currentDomain).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
}

function getAllSessionRatings(req, res, next) {
  sessionServices.getAllSessionRatings().then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
}

function remove(req, res, next) {
  sessionServices.removeSession(req.params.id, res.locals.currentDomain.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
}

function copy(req, res, next) {
  sessionServices.copySession(req.params.id, res.locals.currentDomain.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
}

function updateRating(req, res, next) {
  sessionServices.updateSessionMemberRating(req.body, req.user.id, res.locals.currentDomain.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
}

function getResponses(res) {
  return {
    onError: function(error) {
      res.send({ error: error });
    },
    onSuccess: function(result) {
      res.send(prepareParams(result));
    }
  };
}

function prepareParams(result) {
  return {
    sessionListManageRoles: constants.sessionListManageRoles,
    chatRoomUrl: sessionServices.chatRoomUrl(),
    data: result.data,
    message: result.message,
    dateFormat: constants.dateFormat
  };
}

function getSessionByInvite(req, res, next) {
  if (!req.body.token) { res.send({error:'No invite @token has been provided'}); return; }

  sessionServices.getSessionByInvite(req.body.token).then(function(resp) {
    res.send(resp.Session);
  });
}