var onDeletedObject = function(user_id, topic_id, uid) {
	if (topic_id === thisMain.topicID) {
		if (user_id != thisMain.userID) {
			window.whiteboard.paint.deleteObject(uid);
		}
	}
};