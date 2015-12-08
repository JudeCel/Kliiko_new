var expressValidatorStub = require('../helpers/expressValidatorStub.js');

function deleteAllEvents(topicId) {
  var req = expressValidatorStub({
    params: {
      topicId: topicId
    }
  });

  var nextCb = function (err) {
    // TBD
  };

  //var res = { send: null };
  var res = { send: function () {
  } };

  var deleteEvents = require('../handlers/deleteEvents.js');
  deleteEvents.validate(req, function (err) {
    if (err) return nextCb(err);
    deleteEvents.run(req, res, nextCb);
  });
}

module.exports = deleteAllEvents;
