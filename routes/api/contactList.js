'use strict';
var contactListService = require('../../services/contactList');
var contactListUserService = require('../../services/contactListUser');
var MessagesUtil = require('./../../util/messages');
var _ = require('lodash');
var validations = require('../helpers/validations');
var fs = require('fs');


module.exports = {
  index: index,
  create: create,
  destroy: destroy,
  update: update,
  parseImportFile: parseImportFile,
  importContacts: importContacts,
  validateContacts: validateContacts
};

function index(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  let sessionId = req.query.sessionId;

  contactListService.allByAccount(accountId, sessionId).then(function(lists) {
    res.send(lists);
  },function(err) {
    res.send({ error: err });
  });
};

// Create Params example
// {  customFields: ARRAY/optional =>  [ someCustomFieldsName ],
//    name: STRING/required => "someName",
//    editable: BOOLEAN/optional => true Default value true in DB
//  }
//

function create(req, res, next) {
  validations.params(res, req.body.name, 'Body param @name {string} is required');
  validations.params(res, req.body.customFields, 'Body param @customFields {array} is required');

  req.body.customFields = _.uniq(req.body.customFields);

  let params = req.body;
  params.accountId = res.locals.currentDomain.id;

  contactListService.create(params).then(function(result) {
    res.send({ list: result, message: MessagesUtil.routes.contactList.created });
  }, function(error) {
    res.send({ error: error });
  })
}

// Create Params example
// {  customFields: ARRAY/optional =>  [ someCustomFieldsName ],
//    visibleFields: ARRAY/optional =>  [ someCustomFieldsNames and/or defaultFildesNames ],
//    name: STRING/optional => "someName",
//  }
//
function update(req, res, next) {
  validations.params(res, req.params.id, 'query param @id is missed');

  let params = req.body;
  params.id = req.params.id;
  params.accountId = res.locals.currentDomain.id;

  contactListService.update(params).then(function(result) {
    res.send({success: true, itemsUpdatedAmount:result, message: MessagesUtil.routes.contactList.updated });
  }, function(err) {
    res.send({ error: err });
  })
}

// Create Params example
// {
//    id: INTEGER/required => 1
//  }
//

function destroy(req, res, next) {
  validations.params(res, req.params.id, 'query param @id is missed');

  let accountId = res.locals.currentDomain.id;
  contactListService.destroy(req.params.id, accountId).then(function(lists) {
    res.send({success: true, lists: lists, message: MessagesUtil.routes.contactList.removed});
  },function(err) {
    res.send({ error: err });
  });
}

function parseImportFile(req, res, next) {

  validations.params(res, req.file, 'file is missed');
  validations.params(res, req.params.id, 'query param @id is missed');

  let contactListId = req.params.id;
  let file = req.file;
  contactListService.parseFile(contactListId, file.path).then(function(result) {
    res.send({success: true, result: result});
    fs.unlink(file.path);
  }, function(err) {
    res.send({error:err});
    fs.unlink(file.path);
  })
}

function validateContacts(req, res, next) {
  validations.params(res, req.params.id, 'query param @id is missed');
  let contactListId = req.params.id;
  contactListService.validateContactList(contactListId, req.body.contactsArray).then(function(result) {
    res.send({success: true, result: result});
  }, function(err) {
    res.send({error:err});
  })
}

function importContacts(req, res, next) {
  validations.params(res, req.params.id, 'query param @id is missed');
  validations.body(res, req.body.contactsArray, 'contactsArray is missed');

  let accountId = res.locals.currentDomain.id;

  contactListUserService.bulkCreate(req.body.contactsArray, accountId).then(
    function(result) {
      res.send({success: true, data:result, message: MessagesUtil.routes.contactList.imported });
    },
    function (err) {
      if (err.name && err.name === 'SequelizeUniqueConstraintError') {
        res.send({error: {message:'Some email(s) already taken'}});
        return;
      }
      res.send({error: err});
    }
  );



}
