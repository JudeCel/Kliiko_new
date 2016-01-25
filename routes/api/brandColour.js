var constants = require('../../util/constants');
var brandColourServices = require('../../services/brandColour');

function get(req, res, next) {
  brandColourServices.findAllSchemes(res.locals.currentDomain).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function remove(req, res, next) {
  brandColourServices.removeScheme(req.query, res.locals.currentDomain).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function copy(req, res, next) {
  brandColourServices.copyScheme(req.body, res.locals.currentDomain).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function getResponses(res) {
  return {
    onError: function(error) {
      res.send({ error: error });
    },
    onSuccess: function(result) {
      res.send({ data: result.data, message: result.message, manageFields: brandColourServices.manageFields() });
    }
  };
}

module.exports = {
  get: get,
  remove: remove,
  copy: copy
};
