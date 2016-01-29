"use strict";
let q = require('q');
let topicsService = require('./../../services/topics');

module.exports = {
  get: getAll,
  post: post,
  deleteById: deleteById,
  updateById: updateById
};

function getAll(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  topicsService.getAll(accountId).then(
    function(response) { res.send(response)},
    function(error) { res.send({error:error})}
  );
}



function post(req, res, next) {

  if (!req.body.topic) { res.send({error: '@topic body param is missed'}); return }

  let params = req.body.topic;
  params.accountId = res.locals.currentDomain.id;

  topicsService.create(params).then(
    function(response) { res.send({success: true, data:response})},
    function(error) { res.send({error:error})}
  );

}

function deleteById(req, res, next) {
  if (!req.params.id) {
    res.send({error: '@id param is missed'});
    return
  }

  topicsService.destroy(req.params.id).then(
    function(response) { res.send({success: true, data:response})},
    function(error) { res.send({error:error})}
  );

}

function updateById(req, res) {
  if (!req.params.id) {
    res.send({error: '@id query param is missed'});
    return
  }

  let params = req.body.topic;

  topicsService.update(params).then(
    function(response) { res.send({success: true, data:response})},
    function(error) { res.send({error:error})}
  );
}