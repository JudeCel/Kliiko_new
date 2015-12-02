
var onSharedresource = function(userId, topic_id, json) {
	if (topic_id === thisMain.topicID) {
		if (userId != thisMain.userID) {
			setResource(json);
		}
	}
};
