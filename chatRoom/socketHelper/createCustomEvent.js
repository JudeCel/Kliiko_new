/*
 Renamed from updateEvents.js
 */
var expressValidatorStub = require('../helpers/expressValidatorStub.js');
var io = require('../sockets.js').io;
var getCustomEventParams = require('./getCustomEventParams.js');

module.exports = function(topicId, userId, command, capturedEvent, encode) {
	var params = {
		topicId: topicId,
		userId: userId,
		command: command,
		event: capturedEvent,
		encodingRequired: encode
	};

	var customEventParams = getCustomEventParams(params);
	if (!customEventParams.isValid)
		return;

	var customEventRequest = expressValidatorStub({
		params: {
			topic_id: topicId,
			user_id: userId,
			cmd: command,
			tag: customEventParams.tag,
			event: customEventParams.event,
			reply_id: customEventParams.replyId
		}
	});


	var errCb = function (err) {
		if (err)
			throw err;
	};

	var resCb = function (result) {

		if (command != "chat")
			return;

		if (!customEventParams.responseObject)
			return;

		var responseObject = customEventParams.responseObject;
        responseObject.id = result.id;

		io().sockets.emit('updatechat', userId, topicId, responseObject);
	};

	var res = { send: resCb };

    function nextCb(){

        var createEvent = require('../handlers/createEvent.js');
        createEvent.validate(customEventRequest, function (err) {
            if (err) { return errCb(err) };
            createEvent.run(customEventRequest, res, errCb);
        });
    };

    var tag = customEventParams.tag;
    if(command == "shareresource" && (tag == 4 || tag == 2)){
        //var socketHelper = require('../socketHelper.js');
        var deleteAllEventsShareResource = require('./deleteAllEventsShareResource.js');
        //socketHelper.
            deleteAllEventsShareResource(topicId, nextCb);

    } else nextCb();

};
