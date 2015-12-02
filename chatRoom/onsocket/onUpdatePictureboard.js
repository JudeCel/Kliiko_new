var onUpdatepictureboard = function(topicId) {
	if (topicId === thisMain.topicID) {
		//	this gets called if the facilitator deletes an image from the pictureboard
		//	this can only happen if we are in pictureboard mode, so no need to check these things.
		console.log("******************************************************************************************");
		console.log("onUpdatepictureboard");
		console.log("******************************************************************************************");

		var json = {
			type: "pictureboard",
			content: "true"
		}

		console.log(json);
		console.log("******************************************************************************************");

		socket.emit('updateconsole', json, window.topicID, window.consoleState, null);

	}
};
