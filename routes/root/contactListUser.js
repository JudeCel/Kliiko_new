'use strict';

var contactListUser = require('../../services/contactListUser');

module.exports = {
  unsubscribe: unsubscribe
};

function unsubscribe(req, res, next) {
  contactListUser.destroyByToken(req.params.token).then(function(response) {
    //direct to appropriate unsibscribe page
    res.redirect('/login');
  }, function(err) {
    //direct to appropriate unsibscribe Error page
    res.redirect('/login');
  });
}
