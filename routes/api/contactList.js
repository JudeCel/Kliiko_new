'use strict';
var contactListService = require('../../services/contactList');
var _ = require('lodash');

module.exports = {
  index: index,
  create: create,
  destroy: destroy,
  update: update
};

function index(req, res, next) {
  let accaountId = res.locals.currentDomain.id;
  contactListService.allByAccount(accaountId).then(function(lists) {
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
  paramsValidation(req.body.name, 'Body param @name {string} is required');
  paramsValidation(req.body.customFields, 'Body param @customFields {array} is required');

  req.body.customFields = _.uniq(req.body.customFields);

  let params = req.body;
  params.accountId = res.locals.currentDomain.id;

  contactListService.create(params).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send({ error: err });
  })
}

// Create Params example
// {  customFields: ARRAY/optional =>  [ someCustomFieldsName ],
//    visibleFields: ARRAY/optional =>  [ someCustomFieldsNames and/or defaultFildesNames ],
//    name: STRING/optional => "someName",
//  }
//
function update(req, res, next) {
  paramsValidation(req.params.id, 'query param @id is missed');

  let params = req.body;
  params.id = req.params.id;
  params.accaountId = res.locals.currentDomain.id;

  contactListService.update(params).then(function(result) {
    res.send({success: true, itemsUpdatedAmount:result});
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
  paramsValidation(req.params.id, 'query param @id is missed');

  let accountId = res.locals.currentDomain.id;
  contactListService.destroy(req.params.id, accountId).then(function(lists) {
    res.send({success: true, lists: lists});
  },function(err) {
    res.send({ error: err });
  });
}

function import(req, res, next) {
  paramsValidation(req.file, 'file is missed');
  paramsValidation(req.params.id, 'query param @id is missed');

  let contactListId = req.params.id;
  let file = req.file;
  contactListService.parseFile(contactListId, file.path).then(function(result) {
    res.send({success: true, result: result});
  }, function(err) {
    res.send({ error: err });
  })
}

function paramsValidation(value, message) {
  if (!value) { res.send({ error: message }); return }
}
