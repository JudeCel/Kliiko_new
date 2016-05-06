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
  accountManagerService.createOrFindAccountManager(req.user, req.body, res.locals.currentDomain.id).then(function(params) {
    inviteService.createInvite(params).then(function(data) {
      res.send({ invite: data.invite, message: 'Successfully sent invite.' });
    }, function(error) {
      res.send({ error: error });
    });
  }, function(error) {
    res.send({ error: error });
  });
};

function put(req, res, next) {
  accountManagerService.updateAccountManager(req.body).then(function(response) {
    res.send(response);
  }, function(error) {
    res.send({ error: error });
  })
}

function removeInvite(req, res, next) {
  var params = { accountUserId: req.query.id };

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
  put: put,
  removeInvite: removeInvite,
  removeAccountUser: removeAccountUser
};
