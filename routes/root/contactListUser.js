'use strict';

var contactListUser = require('../../services/contactListUser');

module.exports = {
  unsubscribe: unsubscribe
};

function unsubscribe(req, res, next) {
  let message = {
      title: "Unsubscribe"
  }

  contactListUser.destroyByToken(req.params.token).then(function(deletedCount) {
    if (deletedCount == 0) {
      message.result = "You are already unsubscribed from mail";
    } else {
      message.result = "You have been unsubscribed from mail";
    }
    res.render('unsubscribe', message);
  }, function(err) {
    res.render('unsubscribe', { result: "an error has accurred"});
  });
}
