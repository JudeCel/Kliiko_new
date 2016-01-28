"use strict";
let q = require('q');
let topicsService = require('./../../services/topics');

module.exports = {
  post: post,
  deleteById: deleteById,
  copyTopicById: copyTopicById,
  updateTopicById: updateTopicById
};


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

function copyTopicById(req, res) {
  res.send('here we are')
}

function updateTopicById(req, res) {
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