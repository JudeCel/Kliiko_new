var onUpdateusers = function(session_id, user_id, data) {
	//	this should be done for all sessions, not just a particular topic
	if (session_id != window.sessionID) return;	//	is this the correct topic?

	if (isEmpty(window.topic)) return;
	
	if (window.avatars === null) {
		window.avatars = window.topic.getAvatars();
	} 

	//	first, lets make sure our avatars are asleep
	var found = false;
	for (var ndxAvatars = 0, la = window.avatars.length; ndxAvatars < la; ndxAvatars++) {
		window.avatars[ndxAvatars].setEmotion('offline');

		//	do we have any data?
		if (!isEmpty(data)) {

			found = false;	//	reset this...
			for (var ndxData = 0, dl = data.length; ndxData < dl; ndxData++) {
				if (data[ndxData].id === window.avatars[ndxAvatars].json.userId) {					
					//	I am calling this with manifestation to bypass offline check
					window.avatars[ndxAvatars].manifestation.setEmotion('normal');
					window.avatars[ndxAvatars].emotion = "normal";

					found = true;

					break;
				}
			}
		}

		//	don't update the avatars just yet
		if (!found) {
			window.avatars[ndxAvatars].setCaption("");
			window.avatars[ndxAvatars].draw();
		}
	}
};
