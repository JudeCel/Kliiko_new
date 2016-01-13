'use strict';
var contactListService = require('../../services/contactList');

module.exports = {
  index: index,
  create: create
};

function index(req, res, next) {
  let accaountId = res.locals.currentDomain.id

  contactListService.allByAccount(accaountId).then(function(lists) {
    res.send(lists);
  },function(err) {
    res.send({ error: err });
  });
};

function create(req, res, next) {
  contactListService.create(req.body).then(function(resul) {
    res.send(lists);
  }, function(err) {
    res.send({ error: err });
  })
}
