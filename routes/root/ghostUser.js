'use strict';

var sessionService = require('../../services/session');
var sessionMemberService = require('../../services/sessionMember');
var recaptcha = require('../../lib/recaptcha');
var Bluebird = require('bluebird');

module.exports = {
  get: get,
  post: post
};

function get(req, res, next) {
  sessionService.checkSessionByPublicUid(req.params.uid).then(function() {
    let captcha = recaptcha.getCaptcha();
    res.render('ghost-user/index', { title: 'Chat Session Login', error: null, uid: req.params.uid, message: null, captcha: captcha.formElement() });
  }, function(error) {
    res.render('ghost-user/index', { title: 'Chat Session Login', error: error, message: null });
  });
}

function post(req, res, next) {
  let captcha = recaptcha.getCaptcha();
  validateCaptcha(captcha, req).then(function() {
    return sessionService.checkSessionByPublicUid(req.params.uid);
  }).then(function(session) {
    return sessionMemberService.createGhost(req.body.name, session);
  }).then(function(sessionMember) {
    res.redirect(chatUrl(sessionMember.token));
  }).catch(function(error) {
    if (error == "The response parameter is missing.") {
      error = "Captcha not confirmed";
    }
    res.render('ghost-user/index', { title: 'Chat Session Login', error: null, uid: req.params.uid, message: error, captcha: captcha.formElement() });
  });
}

function chatUrl(token) {
  return process.env.SERVER_CHAT_DOMAIN_URL + ':' + process.env.SERVER_CHAT_DOMAIN_PORT + "/?ghost_token=" + token;
}

function validateCaptcha(captcha, req) {
  return new Bluebird((resolve, reject) => {
    captcha.validateRequest(req).then(function() {
      resolve();
    }, function(errorCodes) {
      reject(captcha.translateErrors(errorCodes));
    });
  });
}