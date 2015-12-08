var expressValidatorStub = require('../helpers/expressValidatorStub.js');

function updateEvent(topicId, userId, object) {
    if (object == null) return;

    var req = expressValidatorStub({
        params: {
            uid: object.id
        }
    });

    var resCb = function (data) {
        if (!data) {
            createEvent(data);
        } else {
            updateEvent(data);
        }
    }

	function createEvent(data) {
		var req = expressValidatorStub({
			params: {
				userId: userId,
				topicId: topicId,
				tag: 16,
				uid: object.id,
				cmd: "object",
				event: encodeURI(JSON.stringify(object, null))
			}
		});

		var res = {
			send: function(data){}
		};

		var createEvent = require('../handlers/createEvent.js');
		createEvent.validate(req, function (err) {
			if (err) throw err;
			createEvent.run(req, res, function (err) {
				if (err) throw err;
			});
		});
	}

	function updateEvent(data) {
		data.event = encodeURI(JSON.stringify(object, null));
		var req = expressValidatorStub({
			params: data
		});

		var updateEvent = require('../handlers/updateEvent.js');
		updateEvent.validate(req, function (err) {
			if (err) throw err;
			updateEvent.run(req, null, function (err) {
				if (err) throw err;
			});
		});
	}

    var res = {
        send: resCb
    };

    var getEventByUid = require('../handlers/getEventByUid.js');
    getEventByUid.validate(req, function (err) {
        if (err) throw err;
        getEventByUid.run(req, res, function (err) {
            if (err) throw err;
        });
    });
};

module.exports = updateEvent;
