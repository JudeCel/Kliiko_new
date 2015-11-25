
var onSharedresource = function(user_id, topic_id, json) {
	if (topic_id === thisMain.topicID) {
		if (user_id != thisMain.userID) {
			setResource(json);
		}
	}
};
