var onUpdateUndo = function(user_name, topic_id, data) {
	if (topicID === topic_id) {
		dataAsJSON = JSON.parse(data);
		if(dataAsJSON.length>0){
			var	dataDecoded = decodeURI(dataAsJSON[0].event);
			var currentJSON = JSON.parse(dataDecoded);
			window.whiteboard.updateUndo(dataAsJSON[0].id,user_name,topic_id,currentJSON.object);
		}
	}
};