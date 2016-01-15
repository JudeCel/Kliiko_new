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

  topicsService.createNewTopic(req.body.topic).then(
    function(response) { res.send({success: true, data:response})},
    function(error) { res.send({error:error})}
  );

}

function deleteById(req, res, next) {
  if (!req.params.id) {
    res.send({error: '@id param is missed'});
    return
  }

  topicsService.deleteTopicById(req.body.topicName).then(
    function(response) { res.send({success: true, data:response})},
    function(error) { res.send({error:error})}
  );

}

function copyTopicById(req, res) {
  res.send('here we are')
}

function updateTopicById(req, res) {
  if (!req.body.topic) {
    res.send({error: '@topic body param is missed'});
    return
  }

  topicsService.updateTopicById(req.body.topic).then(
    function(response) { res.send({success: true, data:response})},
    function(error) { res.send({error:error})}
  );
}