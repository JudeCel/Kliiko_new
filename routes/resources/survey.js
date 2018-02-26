'use strict';

var json2csv = require('json2csv');
var surveyService = require('../../services/survey');
var accountUserService = require('../../services/accountUser');

function exportSurvey(req, res, next) {
  accountUserService.findById(req.currentResources.accountUser.id).then(function(accountResult) {
    surveyService.exportSurvey(req.params, accountResult.Account).then(function(result) {
      json2csv({ data: result.data.data, fields: result.data.header }, function(error, csv) {
        res.set('Content-Disposition', 'attachment; filename="survey-answers.csv"');
        res.set('Content-Type', 'application/octet-stream');
        res.send(csv);
      });
    }, function(error) {
      res.send({error: error});
    });
  }, function(error) {
    res.send({error: error});
  });
};

module.exports = {
  exportSurvey: exportSurvey
};
