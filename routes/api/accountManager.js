var accountManagerService = require('../../services/accountManager');
var inviteService = require('../../services/invite');

function get(req, res, next) {
  accountManagerService.findAccountManagers(req.user, function(error, users) {
    if(error) {
      res.send({ error: error });
    }
    else {
      res.send({ users: users });
    }
  });
};

function post(req, res, next) {
  accountManagerService.createOrFindUser(req, function(error, params) {
    if(error) {
      return res.send({ error: error });
    }

    inviteService.createInvite(params, function(error, invite) {
      if(error) {
        res.send({ error: error });
      }
      else {
        res.send({ invite: invite, message: 'Successfully sent invite.' });
      }
    });
  });
};

function removeInvite(req, res, next) {
  var params = { userId: req.query.id, accountId: req.user.accountOwnerId };

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
  accountManagerService.findAndRemoveAccountUser(req, function(error, message) {
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
