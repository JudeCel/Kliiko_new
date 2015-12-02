var onDeletedObject = function(userId, topic_id, uid) {
	if (topic_id === thisMain.topicID) {
		if (userId != thisMain.userID) {
			window.whiteboard.paint.deleteObject(uid);
		}
	}
};