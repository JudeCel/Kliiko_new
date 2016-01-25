'use strict';
var contactListService = require('../../services/contactList');

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
  if (!req.body.name) {  res.send({ error: 'Body param @name {string} is required' }); return }
  if (!req.body.customFields) {  res.send({ error: 'Body param @customFields {array} is required' }); return }

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
  if (!req.params.id) { res.send('query param @id is missed'); return }

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
  if (!req.params.id) { res.send('query param @id is missed'); return }

  let accountId = res.locals.currentDomain.id;
  contactListService.destroy(req.params.id, accountId).then(function(lists) {
    res.send({success: true, lists: lists});
  },function(err) {
    res.send({ error: err });
  });
}
