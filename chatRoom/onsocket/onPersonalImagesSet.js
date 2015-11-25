var onPersonalimagesset = function(username, topic_id, json) {
	if (topic_id === thisMain.topicID) {
		//if (username === thisMain.username) {
			topic.getConsole().setDocument(json);				
		//}
	}
};
