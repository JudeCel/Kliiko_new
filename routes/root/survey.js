'use strict';

var appData = require('../../services/webAppData');

function views_path(action) {
  return 'survey/' + action;
};

function index(req, res, next) {
  res.locals.appData = appData;
  res.render(views_path('index'), { title: 'Survey', surveyId: req.params.id });
};

module.exports = {
  index: index
};
