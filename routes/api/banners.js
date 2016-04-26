'use strict';

var bannersServices = require('./../../services/banner');

module.exports = {
  create: create
};

function create(req, res, next) {
  bannersServices.create(req.body).then(function(result) {
    res.send({ data: result });
  }, function(error) {
    res.send({ error: error });
  });
}
