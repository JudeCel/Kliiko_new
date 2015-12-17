var onUpdateRedo = function(user_name, topicId, data) {
	if (topicID == topicId) {
		dataAsJSON = JSON.parse(data);
		if(dataAsJSON.length>0){
			var	dataDecoded = decodeURI(dataAsJSON[0].event);
			var currentJSON = JSON.parse(dataDecoded);
			window.whiteboard.updateRedo(dataAsJSON[0].id,user_name,topicId,currentJSON.object);
		}
	}
};
