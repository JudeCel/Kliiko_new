var expressValidatorStub = require('../helpers/expressValidatorStub.js');
var sockets = require('../sockets.js'), io = sockets.io;

function enqueryVote(socket, voteID, topicID, userID, isfacilitator) {
	if (topicID == null || userID == null || voteID == null) return;

	var req = expressValidatorStub({
		params: {
			reply_id: voteID
		}
	});

	var resCb = function (result) {
		if (!result) return;
		var data = JSON.stringify(result, null);
		var dataAsJSON = JSON.parse(data);
		var tag = false;

		if (isfacilitator) {
			tag = true;
		} else {
			for (var ndx = 0; ndx < dataAsJSON.length; ndx++) {
				var voteEvent = decodeURI(dataAsJSON[ndx].event);
				var eventAsJson = JSON.parse(voteEvent);

				if (dataAsJSON[ndx].userId == userID && dataAsJSON[ndx].topic_id == topicID && eventAsJson.answer != "<No Answer>") {
					tag = true;
					break;
				}
			}
		}

		if (tag) {
            socket.emit('enqueryvotereturn', tag, data);
		} else {
            socket.emit('enqueryvotereturn', tag, null);
		}
	};

	var nextCb = function (err) {
		if (err) throw err;
	};

	var res = { send: resCb };

	var getEventByReplyId = require('../handlers/getEventByReplyId.js');
	getEventByReplyId.validate(req, function (err) {
		if (err) return nextCb(err);
		getEventByReplyId.run(req, res, nextCb);
	});
}

module.exports = enqueryVote
