'use strict';
var json2csv = require('json2csv');
var subdomains = require('../lib/subdomains.js');
var accountDatabase = require('../services/admin/accountDatabase');
var params = accountDatabase.simpleParams({ message: null, error: null }, '');

function views_path(action) {
  return 'dashboard/' + action;
};

function get(req, res) {
  accountDatabase.findAllAccounts(function (result) {
    params['accounts'] = result;
    params['message'] = req.flash('message')[0]
    res.render(views_path('accountDatabase'), params);
  });
};

function exportCsv(req, res) {
  let csvHeader = ['Account Name', 'Account Manager', 'Date of Sign-up', 
                   'E-mail', 'Postal', 'City', 'State', 'Postcode', 
                   'Country', 'Company', 'Gender', 'Mobile', '# Sessions purchased', 'Tips permission',
                   '# Active Sessions', 'Comment']

  accountDatabase.getCsvJson(function (err, result) {
    json2csv({ data: result, fields: csvHeader }, function(err, csv) {
      if (err) console.log(err);
      res.set('Content-Disposition', 'attachment; filename="account-database.csv"');
      res.set('Content-Type', 'application/octet-stream');
      res.send(csv);
    });

    accountDatabase.findAllAccounts(function (result) {
      params['accounts'] = result;
      res.render(views_path('accountDatabase'), params);
    });
  });
};

function updateComment(req, res) {
  let userId = req.body.userId;
  let comment = req.body.comment; 

  accountDatabase.editComment(userId, comment, function(error, result){
    if (error) {
      params['error'] = error;
      res.render(views_path('accountDatabase'), params);
    } else {
      req.flash('message', "Comment successfully updated.");
      res.redirect("/dashboard/accountDatabase");
    };
  });
};

function reactivateOrDeactivate(req, res) {
  let userId = req.body.userId;
  let accountId = req.body.accountId; 

  accountDatabase.reactivateOrDeactivate(userId, accountId, function(error, result){
    if (error) {
      params['error'] = error;
      res.render(views_path('accountDatabase'), params);
    } else {
      req.flash('message', "Comment successfully updated.");
      res.redirect("/dashboard/accountDatabase");
    };
  });
};

module.exports = {
  get: get,
  exportCsv: exportCsv,
  updateComment: updateComment,
  reactivateOrDeactivate: reactivateOrDeactivate
}
