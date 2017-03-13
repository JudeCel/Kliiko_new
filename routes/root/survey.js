'use strict';

var appData = require('../../services/webAppData');

function views_path(action) {
  return 'survey/' + action;
};

function index(req, res, next) {
  res.locals.appData = appData;
  res.render(views_path('index'), { title: 'Survey', surveyId: req.params.id, chatUrl: chatUrl(req.query.token) });
};

function chatUrl(token) {
  return process.env.SERVER_CHAT_DOMAIN_URL + ':' + process.env.SERVER_CHAT_DOMAIN_PORT + "/?ghost_token=" + token;
}

module.exports = {
  index: index
};
