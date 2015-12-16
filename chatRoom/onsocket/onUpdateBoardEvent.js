var onUpdateBoardEvent = function(user_name, topicId, data) {
	dataAsJSON = JSON.parse(data);

	if(dataAsJSON.length > 0){
		if (user_name == thisMain.username) {
			window.whiteboard.updateEvent(topicId, dataAsJSON[0].eventId);
		}
	}
};
