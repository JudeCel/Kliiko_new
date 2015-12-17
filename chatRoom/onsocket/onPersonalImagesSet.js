var onPersonalimagesset = function(username, topicId, json) {
	if (topicId == thisMain.topicID) {
		//if (username === thisMain.username) {
			topic.getConsole().setDocument(json);
		//}
	}
};
