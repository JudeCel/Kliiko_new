'use strict';
var inviteService = require('../services/invite');

function views_path(action) {
  return 'dashboard/' + action;
};

function get(req, res) {
  console.log(req.params);
  // inviteService.findUserManagers(req.user, function(error, accounts) {
  //   res.render(views_path('accountManager'), { title: 'Account Managers', accounts: accounts, message: req.flash('message')[0] });
  // });
};

module.exports = {
  get: get
}
