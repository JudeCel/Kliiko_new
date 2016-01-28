"use strict";
let q = require('q');
let topicsService = require('./../../services/topics');

module.exports = {
  get: get
};


function get(req, res, next) {
  let accountId = res.locals.currentDomain.id;
  topicsService.getAll(accountId).then(
    function(response) { res.send(response)},
    function(error) { res.send({error:error})}
  );

}
