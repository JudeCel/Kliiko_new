'use strict';

var contactListUserService = require('../../services/contactListUser');
var validations = require('../helpers/validations');
var MessagesUtil = require('./../../util/messages');

module.exports = {
  create: create,
  update: update,
  destroy: destroy,
  comments: comments
};

// Create Params example
// {  defaultFields: Object/optional =>  { firstName: "name" },
//    customFields: Object/optional =>  { customFieldsName: "someValue"}
//    contactListId: INTEGER/required => 1
//  }
//
function create(req, res, next) {
  let params = req.body;
  params.accountId = req.currentResources.account.id;

  contactListUserService.create(params).then(function(result) {
    res.send({ user: result, message: MessagesUtil.routes.contactListUser.newUser, facMessage: MessagesUtil.routes.contactListUser.newFacilitator });
  }, function(err) {
    res.send({ error: err });
  })
}

// Create Params example
// list: [{  defaultFields: Object/optional =>  { firstName: "name" },
//    customFields: Object/optional =>  { customFieldsName: "someValue"}
//    contactListId: INTEGER/required => 1
//  }, {....},{....}]
//
function createBulk(req, res, next) {
  validations.params(req.params.list, 'query param @list is missed');
  let accountId = req.currentResources.account.id;

  contactListUserService.bulkCreate(params.list, accountId).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send({ error: err });
  })
}

// Destroy Params example
// {
//  ids: Array/required =>  [1,2,...]
// }
//
function destroy(req, res, next) {
  validations.params(res, req.body.ids, 'query param @ids is missed');

  let ids = req.body.ids;
  let accountId = req.currentResources.account.id;
  contactListUserService.destroy(ids, accountId).then(function (result) {
    res.send({success:true, total: result});
  },function(err) {
    res.send({ error: err });
  });
}

// Update Params example
//
// {  id: INTEGER/required => 1,
//    defaultFildes: Object/optional =>  { firstName: "name" },
//    customFields: Object/optional =>  { customFieldsName: "someValue"}
//    contactListId: INTEGER/required => 1
//  }
//
function update(req, res, next) {
  validations.params(res, req.params.id, 'query param @id is missed');

  let params = req.body;
  params.accountId = req.currentResources.account.id;
  params.id = req.params.id;

  contactListUserService.update(params).then(function(result) {
    res.send({success: true, data: result, message: MessagesUtil.routes.contactListUser.updated });
  }, function(err) {
    res.send({ error: err });
  })
}

// Comments Params example
// {
//  id: INTEGER/required =>  1,
//  contactListId: INTEGER/required =>  1
// }
//
function comments(req, res, next) {
  let params = req.body;
  params.accountId = req.currentResources.account.id;

  contactListUserService.comments(params).then(function(result) {
    res.send({ success: true, data: result });
  }, function(err) {
    res.send({ error: err });
  })
}
