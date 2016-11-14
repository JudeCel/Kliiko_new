'use strict';

var constants = require('../../util/constants');
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
      let ownAccounts = 0;
      if (result["accountManager"]) {
        for(let i=0; i<result["accountManager"].data.length; i++) {
          if (result["accountManager"].data[i].owner) {
            ownAccounts++;
          }
        }
      }

      res.send({
        data: result,
        dateFormat: constants.dateFormatWithTime,
        hasOwnAccount: ownAccounts > 0,
        hasRoles: Object.keys(result).length > 0,
        canCreateNewAccount: ownAccounts < constants.maxAccountsAmount
      });
    }
  };
};
