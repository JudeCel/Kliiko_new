'use strict';

var models = require('./../models');
var SessionMember = models.SessionMember;
var q = require('q');
var uuid = require('node-uuid');
var _ = require('lodash');
const MESSAGES = {
  notFound: "Session Member not Found with Id: "
}


module.exports = {
  createToken: createToken,
  MESSAGES: MESSAGES
}


// When users join to a chat room each time need generate a new token!
function createToken(id) {
  let deferred = q.defer();
  let token = uuid.v1();

  SessionMember.update({token: token}, {where: {id: id }}).then(function(result) {
    if (result[0] > 0) {
      deferred.resolve(true)
    }else {
      deferred.reject(MESSAGES.notFound + id)
    }
  });

  return deferred.promise;
}
