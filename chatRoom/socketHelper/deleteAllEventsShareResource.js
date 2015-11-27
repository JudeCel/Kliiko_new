var expressValidatorStub = require('../helpers/expressValidatorStub.js');

function deleteEventsShareResource(topicId, nextCb) {
    var req = expressValidatorStub({
        params: {
            topic_id: topicId
        }
    });

    var errCb = function (err) {
        // TBD
    };

    var res = { //send: null
        send: nextCb
    };

    var deleteEvents = require('../handlers/deleteEventsShareResource.js');
    deleteEvents.validate(req, function (err) {
        if (err) return errCb(err);
        deleteEvents.run(req, res, errCb);
    });
}

module.exports = deleteEventsShareResource;
