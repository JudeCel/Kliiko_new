var accountManagerService = require('../../services/accountManager');
var inviteService = require('../../services/invite');

function get(req, res, next) {
  accountManagerService.findAccountManagers(res.locals.currentDomain.id, function(error, accountUsers) {
    if(error) {
      res.send({ error: error });
    }
    else {
      res.send({ accountUsers: accountUsers });
    }
  });
};

function post(req, res, next) {
  accountManagerService.createOrFindAccountManager(req, res, function(error, params) {
    if(error) {
      return res.send({ error: error });
    }

    inviteService.createInvite(params).then(function(data) {
      res.send({ invite: data.invite, message: 'Successfully sent invite.' });
    }, function(error) {
      res.send({ error: error });
    });
  });
};

function removeInvite(req, res, next) {
  var params = { accountUserId: req.query.id, accountId: res.locals.currentDomain.id };

  inviteService.findAndRemoveInvite(params, function(error, message) {
    if(error) {
      res.send({ error: error });
    }
    else {
      res.send({ message: message });
    }
  });
};

function removeAccountUser(req, res, next) {
  accountManagerService.findAndRemoveAccountUser(req.query.id, function(error, message) {
    if(error) {
      res.send({ error: error });
    }
    else {
      res.send({ message: message });
    }
  });
};

module.exports = {
  get: get,
  post: post,
  removeInvite: removeInvite,
  removeAccountUser: removeAccountUser
};
