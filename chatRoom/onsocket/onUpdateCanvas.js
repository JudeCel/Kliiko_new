var onUpdatecanvas = function(user_id, topic_id, data) {
	if (user_id != thisMain.userID) {
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
