var surveyService = require('../../services/survey');

function get(req, res, next) {
  surveyService.findAllSurveys(req.user).then(
    getResponses(res).onError,
    getResponses(res).onSuccess
  );
};

function getResponses(res) {
  return {
    onError: function(error) {
      res.send({ error: error });
    },
    onSuccess: function(surveys) {
      res.send({ surveys: surveys });
    }
  };
}

module.exports = {
  get: get
};
