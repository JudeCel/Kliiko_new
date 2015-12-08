var onUpdatecanvas = function(userId, topicId, data) {
	if (userId != thisMain.userID) {
		if (topicID === topicId) {
			if (topic) window.whiteboard.updateCanvas(username, data);

			var updateThumbPositionJSON = {
				type: 'date',
				value: new Date()
			};

			//setThumbPosition(updateThumbPositionJSON);
		}
	}
};
