'use strict';
var accountDatabase = require('../services/admin/accountDatabase');
var params = accountDatabase.simpleParams({}, '');

function views_path(action) {
  return 'dashboard/' + action;
};

function get(req, res) {
  accountDatabase.findAllaccounts(function (result) {
    params['accounts'] = result;
    res.render(views_path('accountDatabase'), params);
  });
};


var json2csv = require('json2csv');
var json = [
  {
    "car": "Audi",
    "price": 40000,
    "color": "blue"
  }, {
    "car": "BMW",
    "price": 35000,
    "color": "black"
  }, {
    "car": "Porsche",
    "price": 60000,
    "color": "green"
  }
];

function exportCsv(req, res) {
  let accounts = null;

  json2csv({ data: json, fields: ['car', 'price', 'color'] }, function(err, csv) {
    if (err) console.log(err);
    res.set('Content-Disposition', 'attachment; filename="account-database.csv"');
    res.set('Content-Type', 'application/octet-stream');
    res.send(csv);
  });

  res.render(views_path('accountDatabase'), params);
};

module.exports = {
  get: get,
  exportCsv: exportCsv
}
