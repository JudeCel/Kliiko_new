'use strict';
var sessionServices = require('./../../services/session');

function get(req, res, next) {
  sessionServices.findAllSessions(res.locals.currentDomain.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function remove(req, res, next) {
  sessionServices.removeSession(req.query.sessionId, res.locals.currentDomain.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function copy(req, res, next) {
  sessionServices.copySession(req.body.sessionId, res.locals.currentDomain.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function getResponses(res) {
  return {
    onError: function(error) {
      res.send({ error: error });
    },
    onSuccess: function(result) {
      var results = {
        data: result.data,
        message: result.message,
      };

      res.send(results);
    }
  };
};

module.exports = {
  get: get,
  remove: remove,
  copy: copy
};
