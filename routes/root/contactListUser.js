'use strict';

var contactListUser = require('../../services/contactListUser');

module.exports = {
  unsubscribe: unsubscribe
};

function unsubscribe(req, res, next) {
  let message = {
      title: "Unsubscribe"
  }

  contactListUser.destroyByToken(req.params.token).then(function(response) {
    if (response == 1) {
      message.result = "You have been unsubscribed from mail";
    } else {
      message.result = "You are already unsubscribed from mail";
    }
    res.render('unsubscribe', message);
  }, function(err) {
    res.render('unsubscribe', { result: "an error has accurred"});
  });
}
