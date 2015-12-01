'use strict';
var accountManager = require('../services/accountManager');

function views_path(action) {
  return 'dashboard/' + action;
};

function get(req, res) {
  accountManager.findUserManagers(req.user, function(error, result) {
    res.render(views_path('accountManager'), { title: 'Account Managers', accounts: result });
  });
};

function post(req, res) {

};

function destroy(req, res) {

};

module.exports = {
  get: get,
  post: post,
  destroy: destroy
}
