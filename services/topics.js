'use strict';
let q = require('q');

module.exports = {
  getAllTopic: getAllTopic,
  createNewTopic: createNewTopic,
  deleteTopicById: deleteTopicById,
  updateTopicById: updateTopicById
};

function getAllTopic() {
  let deferred = q.defer();


  let list = [
    {name: 'This Is topic name', id: 'topic100500', sessions: [{name:'That is session Name', id: 1, status: 'Closed'},{name:'That is session Name2', id: 2, status: 'Opened'}]},
    {name: 'This Is topic name2', id: 'topic100501', sessions: [{name:'That is session Name2', id: 2}]},
    {name: 'This Is topic name3', id: 'topic100502', sessions: [{name:'That is session Name3', id: 3}]},
    {name: 'This Is topic name8', id: 'topic100503', sessions: [{name:'That is session Name2', id: 2},{name:'That is session Name2', id: 2},{name:'That is session Name4', id: 4}]}
  ];

  deferred.resolve(list);

  return deferred.promise;
}

function createNewTopic(topicObj) {
  let deferred = q.defer();

  let output =  {
    name: topicObj.name,
    id: 'topic'+new Date().getTime(),
    sessions: [
      {name:'That is session Name', id: 1, status: 'Closed'},{name:'That is session Name2', id: 2, status: 'Opened'}
    ]
  };
  output.sessions = topicObj.sessions || null;

  deferred.resolve(output);

  return deferred.promise;
}

function deleteTopicById(id) {
  let deferred = q.defer();

  // dummy output
  let output =  {deletedTopicIdIs: id};
  deferred.resolve(output);

  return deferred.promise;
}

function updateTopicById(topicObj) {
  let deferred = q.defer();

  // dummy output
  deferred.resolve(topicObj);

  return deferred.promise;
}