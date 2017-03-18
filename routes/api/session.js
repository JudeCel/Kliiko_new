'use strict';

var constants = require('../../util/constants');
var sessionServices = require('./../../services/session');
var Services = require('./../../services/session');
var sessionSurvey = require('./../../services/sessionSurvey');

module.exports = {
  get: get,
  comment: comment,
  remove: remove,
  copy: copy,
  updateRating: updateRating,
  getAllSessionRatings: getAllSessionRatings,
  getSessionByInvite: getSessionByInvite,
  setOpen: setOpen,
  getSessionSurveyStats: getSessionSurveyStats
};

function setOpen(req, res, next) {
  sessionServices.setOpen(req.params.id, req.body.open, req.currentResources.account.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
}

function comment(req, res, next) {
  sessionServices.changeComment(req.params.id, req.body.comment, req.currentResources.account.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
}

function get(req, res, next) {
  sessionServices.findAllSessions(req.currentResources.user.id, req.currentResources.accountUser, req.currentResources.account).then(
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
  sessionServices.removeSession(req.params.id, req.currentResources.account.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
}

function copy(req, res, next) {
  sessionServices.copySession(req.params.id, req.currentResources.account.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
}

function updateRating(req, res, next) {
  sessionServices.updateSessionMemberRating(req.body, req.currentResources.user.id, req.currentResources.account.id).then(
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
    data: result.data,
    message: result.message,
    dateFormat: constants.dateFormat,
    baseUrl: result.baseUrl
  };
}

function getSessionByInvite(req, res, next) {
  sessionServices.getSessionByInvite(req.body.token).then(
    function(resp) {
      res.send(resp.Session);
    },
    function(err) {
      res.send({ error: err });
    }
  );
}

function getSessionSurveyStats(req, res, next) {
  sessionSurvey.getSurveyStatsForSession(req.params.id, req.currentResources.account).then(
    function(resp) {
      res.send(resp);
    },
    function(err) {
      res.send({ error: err });
    }
  );
}
