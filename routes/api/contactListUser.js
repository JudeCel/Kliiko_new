'use strict';
var contactListUserService = require('../../services/contactListUser');

module.exports = {
  create: create,
  update: update,
  destroy: destroy
};

// Create Params example
// {  defaultFields: Object/optional =>  { firstName: "name" },
//    customFields: Object/optional =>  { customFieldsName: "someValue"}
//    contactListId: INTEGER/required => 1
//  }
//
function create(req, res, next) {
  let params = req.body;
  params.accountId = res.locals.currentDomain.id;

  contactListUserService.create(params).then(function(result) {
    res.send(result);
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
  if (!params.list) { res.send('query param @list is missed'); return }

  let accountId = res.locals.currentDomain.id;

  contactListUserService.bulkCreate(params.list, accountId).then(function(result) {
    res.send(result);
  }, function(err) {
    res.send({ error: err });
  })
}


// Create Params example

// destroy Params example
// {
//  ids: Array/required =>  [1,2,...]
// }
//

function destroy(req, res, next) {

  let ids = req.body.ids;
  let accountId = res.locals.currentDomain.id;
  contactListUserService.destroy(ids, accountId).then(function (result) {
    res.send({success:true, total: result});
  },function(err) {
    res.send({ error: err });
  });
}

// Update Params example
// {  defaultFildes: Object/optional =>  { firstName: "name" },
//    customFields: Object/optional =>  { customFieldsName: "someValue"}
//    contactListId: INTEGER/required => 1
//  }
//
function update(req, res, next) {
  if (!req.params.id) { res.send('query param @id is missed'); return }

  let params = req.body;
  params.accountId = res.locals.currentDomain.id;
  params.id = req.params.id;
  contactListUserService.update(params).then(function(result) {
    res.send({success:true,data:result});
  }, function(err) {
    res.send({ error: err });
  })
}
