// var mtypes = require('../helpers/mtypes');
var expressValidatorStub = require('../helpers/expressValidatorStub.js');

function updateResources(topicId, userId, content, type, Cb) {
  var req = expressValidatorStub({
    params: {
      topicId: topicId,
      userId: userId,
      private: content.private,
      resourceType: type
    }
  });

  content.type = type;

  if (~['image', 'video', 'vote', 'audio', 'pdf', 'brandLogo', 'youtubeUrl'].indexOf(type)){
    req.params.JSON = encodeURI(JSON.stringify(content, null));
  }
  var nextCb = function (err) {
    // TBD
    if(Cb) {
      Cb(userId, content);
    }
  };

  var res = {
    send: function (data) {
      if(Cb){
        data.JSON = JSON.parse(decodeURI(data.JSON));
        Cb(userId, data);
      }
    }
  };

  var createResource = require('../handlers/createResource.js');
  createResource.validate(req, function (err) {
    if (err) {return nextCb(err)};
    createResource.run(req, res, nextCb);
  });
}

module.exports = updateResources;
