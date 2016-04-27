var json2csv = require('json2csv');
var surveyService = require('../../services/survey');

function exportSurvey(req, res, next) {
  surveyService.exportSurvey(req.params, req.user).then(function(result) {
    json2csv({ data: result.data.data, fields: result.data.header }, function(error, csv) {
      res.set('Content-Disposition', 'attachment; filename="survey-answers.csv"');
      res.set('Content-Type', 'application/octet-stream');
      res.send(csv);
    });
  }, function(error) {

  });
};

module.exports = {
  exportSurvey: exportSurvey
};
