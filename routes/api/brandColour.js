var brandProjectConstants = require('../../util/brandProjectConstants');
var brandColourServices = require('../../services/brandColour');

function get(req, res, next) {
  brandColourServices.findAllSchemes(res.locals.currentDomain.id).then(
    getResponses(res).onSuccess,
    getResponses(res).onError
  );
};

function canCreateCustomColors(req, res, next) {
  brandColourServices.canCreateCustomColors(res.locals.currentDomain.id).then(function(result) {
    res.send({result: result});
  }, function(err) {
    res.send({ error: err });
  });
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
        memberColours: brandProjectConstants.memberColours
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
  update: update,
  canCreateCustomColors: canCreateCustomColors
};
