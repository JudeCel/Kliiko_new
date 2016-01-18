var surveyService = require('../../services/survey');

function get(req, res, next) {
  surveyService.findAllSurveys(req.user).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function find(req, res, next) {
  surveyService.findSurvey(req.body.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function remove(req, res, next) {
  surveyService.removeSurvey(req.query.id, req.user).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function create(req, res, next) {
  var params = req.body;
  params.accountId = req.user.accountOwnerId;

  surveyService.createSurveyWithQuestions(params).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function update(req, res, next) {
  surveyService.updateSurvey(req.body, req.user).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function status(req, res, next) {
  surveyService.changeStatus(req.body, req.user).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function copy(req, res, next) {
  surveyService.copySurvey(req.body).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function answer(req, res, next) {
  surveyService.answerSurvey(req.body).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function confirm(req, res, next) {
  surveyService.confirmSurvey(req.body, req.user).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function getResponses(res) {
  return {
    onError: function(error) {
      res.send({ error: error });
    },
    onSuccess: function(data) {
      res.send({ data: data });
    }
  };
}

module.exports = {
  get: get,
  find: find,
  remove: remove,
  create: create,
  update: update,
  status: status,
  copy: copy,
  answer: answer,
  confirm: confirm
};
