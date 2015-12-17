
var onSharedresource = function(userId, topicId, json) {
	if (topicId == thisMain.topicID) {
		if (userId != thisMain.userID) {
			setResource(json);
		}
	}
};
