var onDeletedObject = function(userId, topicId, uid) {
	if (topicId === thisMain.topicID) {
		if (userId != thisMain.userID) {
			window.whiteboard.paint.deleteObject(uid);
		}
	}
};