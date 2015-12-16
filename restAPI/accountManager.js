var accountManagerService = require('../services/accountManager');
var inviteService = require('../services/invite');

module.exports = function(app, restUrl) {
  var restUrl = restUrl + '/accountManager';

  app.get(restUrl, function(req, res) {
    req.user ? proceed() : notAuthExit(res);

    function proceed() {
      accountManagerService.findAccountManagers(req.user, function(error, users) {
        if(error) {
          res.send({ error: error });
        }
        else {
          res.send({ users: users });
        }
      });
    };
  });

  app.post(restUrl, function(req, res) {
    req.user ? proceed() : notAuthExit(res);

    function proceed() {
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
  });

  app.get(restUrl + '/remove', function (req, res) {
    req.user ? proceed() : notAuthExit(res);

    function proceed() {
      accountManagerService.removeInviteOrAccountUser(req, function(error, message) {
        if(error) {
          res.send({ error: error });
        }
        else {
          res.send({ message: message });
        }
      });
    };
  });

  function notAuthExit(res) {
    res.status(403).send('not authorized');
  };
};
