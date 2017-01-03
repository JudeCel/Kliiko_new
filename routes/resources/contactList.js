var json2csv = require('json2csv');
var contactListService = require('../../services/contactList');
var accountUserService = require('../../services/accountUser');

function exportContactList(req, res, next) {
  accountUserService.findById(req.user.accountUserId).then(function(accountResult) {
    contactListService.exportContactList(req.params, accountResult.Account).then(function(result) {
      json2csv({ data: result.data, fields: result.header }, function(error, csv) {
        res.set('Content-Disposition', 'attachment; filename="contactlist.csv"');
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
  exportContactList: exportContactList
};
