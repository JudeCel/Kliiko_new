'use strict';

var myDashboardServices = require('./../../services/myDashboard');

module.exports = {
  getAllData: getAllData
};

function getAllData(req, res, next) {
  myDashboardServices.getAllData(req.user.id, req.protocol).then(
    getResponses(req, res).onSuccess,
    getResponses(req, res).onError
  );
};

function getResponses(req, res) {
  return {
    onError: function(error) {
      res.send({ error: error });
    },
    onSuccess: function(result) {
      res.send({ data: result });
    }
  };
};
