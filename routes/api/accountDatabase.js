var json2csv = require('json2csv');
var constants = require('../../util/constants');
var accountDatabaseService = require('../../services/admin/accountDatabase');

function get(req, res, next) {
  accountDatabaseService.findAllAccounts(function(error, accounts) {
    if(error) {
      res.send({ error: error });
    }
    else {
      res.send({ accounts: accounts, dateFormat: constants.dateFormat });
    }
  });
};

function update(req, res, next) {
  accountDatabaseService.updateAccountUser(req.body, req.user, function(error, account) {
    if(error) {
      res.send({ error: error });
    }
    else {
      res.send({ account: account, message: 'Successfully updated account user' });
    }
  });
};

function updateAccountUserComment(req, res, next) {
  accountDatabaseService.updateAccountUserComment(req.body).then(function(account) {
    res.send({ account: account, message: 'Successfully updated account user' });
  }, function(error) {
    res.send({ error: error });
  });
};

module.exports = {
  get: get,
  updateAccountUserComment: updateAccountUserComment,
  update: update
};
