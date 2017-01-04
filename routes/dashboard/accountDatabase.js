'use strict';

var json2csv = require('json2csv');
var accountDatabaseService = require('../../services/admin/accountDatabase');

function exportCsv(req, res, next) {
  accountDatabaseService.csvData().then(function(data) {
    json2csv({ data: data, fields: accountDatabaseService.csvHeader() }, function(err, csv) {
      res.set('Content-Disposition', 'attachment; filename="account-database.csv"');
      res.set('Content-Type', 'application/octet-stream');
      res.send(csv);
    }, function(err) {
      res.send({errors: err})
    });
  });
};

module.exports = {
  exportCsv: exportCsv
}
