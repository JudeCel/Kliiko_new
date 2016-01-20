'use strict';
var contactListService = require('../../services/contactList');

module.exports = {
  index: index,
  create: create,
  destroy: destroy
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
// {  defaultFildes: ARRAY/optional =>  [ firstName ]
//    customFields: ARRAY/optional =>  [ someCustomFieldsName ],
//    contactListId: INTEGER/required => 1,
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
// {
//    id: INTEGER/required => 1
//  }
//
function destroy(req, res, next) {
  let accaountId = res.locals.currentDomain.id
  contactListService.destroy(req.body.id, accaountId).then(function(lists) {
    res.send(lists);
  },function(err) {
    res.send({ error: err });
  });
}
