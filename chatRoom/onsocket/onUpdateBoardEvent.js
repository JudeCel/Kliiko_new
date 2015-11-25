var onUpdateBoardEvent = function(user_name, topic_id, data) {
	dataAsJSON = JSON.parse(data);
	
	if(dataAsJSON.length > 0){
		if (user_name === thisMain.username) {
			window.whiteboard.updateEvent(topic_id, dataAsJSON[0].eventId);
		}
	}
};