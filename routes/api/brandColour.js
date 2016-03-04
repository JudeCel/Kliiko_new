var brandProjectConstants = require('../../util/brandProjectConstants');
var brandColourServices = require('../../services/brandColour');

function get(req, res, next) {
  brandColourServices.findAllSchemes(res.locals.currentDomain.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function remove(req, res, next) {
  brandColourServices.removeScheme(req.query, res.locals.currentDomain.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function copy(req, res, next) {
  brandColourServices.copyScheme(req.body, res.locals.currentDomain.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function create(req, res, next) {
  brandColourServices.createScheme(req.body, res.locals.currentDomain.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function update(req, res, next) {
  brandColourServices.updateScheme(req.body, res.locals.currentDomain.id).then(
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
      var results = {
        data: result.data,
        message: result.message,
        manageFields: brandColourServices.manageFields(),
        hexRegex: brandProjectConstants.hexRegex,
        participantColours: brandProjectConstants.participantColours
      };

      res.send(results);
    }
  };
}

module.exports = {
  get: get,
  remove: remove,
  copy: copy,
  create: create,
  update: update
};
