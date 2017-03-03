var constants = require('../../util/constants');
var surveyService = require('../../services/survey');

function get(req, res, next) {
  surveyService.findAllSurveys(req.currentResources.account).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function canExportSurveyData(req, res, next) {
  surveyService.canExportSurveyData(req.currentResources.account).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
}

function getSurveyStats(req, res, next) {
  surveyService.getSurveyStats(req.query.id, req.currentResources.account).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
}

function find(req, res, next) {
  surveyService.findSurvey(req.query, req.query.skipValidations).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function remove(req, res, next) {
  surveyService.removeSurvey(req.query, req.currentResources.account).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function create(req, res, next) {
  surveyService.createSurveyWithQuestions(req.body, req.currentResources.account).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function update(req, res, next) {
  surveyService.updateSurvey(req.body, req.currentResources.account).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function status(req, res, next) {
  surveyService.changeStatus(req.body, req.currentResources.account).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function copy(req, res, next) {
  surveyService.copySurvey(req.body, req.currentResources.account).then(
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
  surveyService.confirmSurvey(req.body, req.currentResources.account).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function getConstants(req, res, next) {
  surveyService.constantsSurvey({type: req.query.type}).then(
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
      res.send({ data: result.data, message: result.message, dateFormat: constants.dateFormat });
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
  confirm: confirm,
  getConstants: getConstants,
  canExportSurveyData: canExportSurveyData,
  getSurveyStats: getSurveyStats
};
