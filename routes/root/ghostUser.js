'use strict';

var sessionService = require('../../services/session');
var sessionMemberService = require('../../services/sessionMember');
var recaptcha = require('recaptcha2')

module.exports = {
  get: get,
  post: post
};

function getCaptcha() {
  return new recaptcha({
    siteKey:'6LekfhcUAAAAAM6MfFRSud5fddd76HkrHpEo2sLF',
    secretKey:'6LekfhcUAAAAAH-2NMv74uTJrYsqgcShWhdQCZEt'
  });
}

function get(req, res, next) {
  sessionService.checkSessionByUid(req.params.uid).then(function() {
    let captcha = getCaptcha();
    res.render('ghost-user/index', { title: 'Chat Session Login', error: null, uid: req.params.uid, message: null, captcha: captcha.formElement() });
  }, function(error) {
    res.render('ghost-user/index', { title: 'Chat Session Login', error: error, message: null });
  });
}

function post(req, res, next) {
  let captcha = getCaptcha();
  captcha.validateRequest(req).then(function() {
    sessionService.checkSessionByUid(req.params.uid).then(function(session) {
      return sessionMemberService.createGhost(req.body.name, session);
    }).then(function(sessionMember) {
      let link = process.env.SERVER_CHAT_DOMAIN_URL + ':' + process.env.SERVER_CHAT_DOMAIN_PORT + "/?ghost_token=" + sessionMember.token;
      res.redirect(link);
    }).catch(function(error) {
      res.render('ghost-user/index', { title: 'Chat Session Login', error: null, uid: req.params.uid, message: error, captcha: captcha.formElement() });
    });
  }).catch(function(errorCodes) {
    res.render('ghost-user/index', { title: 'Chat Session Login', error: null, uid: req.params.uid, message: captcha.translateErrors(errorCodes), captcha: captcha.formElement() });
  });
}
