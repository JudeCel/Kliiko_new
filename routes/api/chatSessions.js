'use strict';

var chatSessions = require('./../../services/chatSessions');

module.exports = {
  get: get,
  remove: remove,
  copy: copy
};

function get(req, res, next) {    
  chatSessions.getAllSessions(res.locals.currentDomain.id).then(function(result) {
    res.send({results: result});
  }, function(error) {
    res.send({errors: error});
  });
}

function remove(req, res, next) {
  let sessionId = req.query.sessionId;
  let userId = req.user.id

  chatSessions.deleteSession(sessionId, userId).then(function(result) {
    res.send({message: result});
  }, function(error) {
    res.send({error: error});
  })
}

function copy(req, res, next) {
  let sessionId = req.body.sessionId;
  let userId = req.user.id;

  chatSessions.copySession(sessionId, userId).then(function(result) {
    res.send(result);
  }, function(error) {
    res.send({error: error});
  })
}