'use strict';

function views_path(action) {
  return 'survey/' + action;
};

function index(req, res, next) {
  res.render(views_path('index'), { title: 'Survey', surveyId: req.params.id });
};

module.exports = {
  index: index
};