'use strict';

var bannersServices = require('./../../services/banner');

module.exports = {
  create: create,
  update: update
};

function create(req, res, next) {
  bannersServices.create(req.body).then(function(data) {
    res.send(data);
  }, function(error) {
    res.send({ error: error });
  });
}

function update(req, res, next) {
  bannersServices.update(req.body).then(function(data) {
    res.send(data);
  }, function(error) {
    res.send({ error: error });
  });
}
