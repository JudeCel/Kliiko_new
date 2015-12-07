var expressValidatorStub = require('../helpers/expressValidatorStub.js');

module.exports = function(topicId, userId, id, tag, command, capturedEvent, callback) {



    var customEventRequest = expressValidatorStub({
        params: {
            id: id,
            topicId: topicId,
            userId: userId,
            cmd: command,
            tag: tag,
            event: encodeURI(capturedEvent)
        }
    });

    var errCb = function (err) {
        if (err)
            throw err;
    };

    var resCb = function (result) {
        if (!result) return;

        callback();
    };

    var res = { send: resCb };

    var updateEvent = require('../handlers/updateEvent.js');
    updateEvent.validate(customEventRequest, function (err) {
        if (err) return errCb(err);
        updateEvent.run(customEventRequest, res, errCb);
    });
};
