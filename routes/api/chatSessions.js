'use strict';

var chatSessions = require('./../../services/chatSessions');

module.exports = {
  get: get
};

function get(req, res, next) {    
  chatSessions.getAllSessions(res.locals.currentDomain.id).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send(({ error: err.message }));
  });
}