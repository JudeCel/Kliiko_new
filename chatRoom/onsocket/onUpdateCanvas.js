var onUpdatecanvas = function(userId, topic_id, data) {
	if (userId != thisMain.userID) {
		if (topicID === topic_id) {
			if (topic) window.whiteboard.updateCanvas(username, data);

			var updateThumbPositionJSON = {
				type: 'date',
				value: new Date()
			};

			//setThumbPosition(updateThumbPositionJSON);
		}
	}
};
