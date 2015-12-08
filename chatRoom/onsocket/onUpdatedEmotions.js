var onUpdatedemotions = function(userId, topicId, data) {
	if (topicId === window.topicID) {
		if (userId != window.userID) {
			if (window.avatars === null) {
				window.avatars = window.topic.getAvatars();
			}
			// console.log(":onUpdateemotions");
			// console.log(data);

			var names = Object.keys(data);
			var ndx = 0,
				la = 0;
			for (var ndxNames = 0, ln = names.length; ndxNames < ln; ndxNames++) {
				var name = names[ndxNames],
					emotion = data[name];

				for (ndx = 0, la = window.avatars.length; ndx < la; ndx++) {
					if (window.avatars[ndx].json.name === name) {
						//	don't update if offline
						if (window.avatars[ndx].emotion != "offline") {
							window.avatars[ndx].setEmotion(emotion);
							window.avatars[ndx].draw();
						}

						break;
					}
				}
			}			
		}
	}
};