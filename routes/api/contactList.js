'use strict';
var contactListService = require('../../services/contactList');

function index(req, res, next) {
  let accaountId = res.locals.currentDomain.id

  contactListService.allByAccount(accaountId).then(function(lists) {
    res.send(lists);
  },function(err) {
    res.send({ error: error });
  });
};

module.exports = {
  index: index
};
