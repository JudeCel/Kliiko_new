// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var participantsDetails = function(topic_id, participants, id, user_id) {
	for (var ndx = 0, np = participants.length; ndx < np; ndx++) {
		if (participants[ndx].user_id === user_id) {
			return {
				id: id,
				number: ndx,
				name: participants[ndx].fullName,
				colour: participants[ndx].colour
			};
		}
	}
	
	return null;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var updateCorkboard = function(personalImage, participantsDetailsJSON) {
	var canvasWidth = window.whiteboardLarge.width,
		canvasHeight = window.whiteboardLarge.height,
		canvasPersonalImageWidth = (canvasWidth / 4),
		canvasPersonalImageHeight = (canvasHeight / 2);
		
	var x = ((participantsDetailsJSON.number % 4) * canvasPersonalImageWidth),
		y = (((participantsDetailsJSON.number < 4) ? 0 : 1) * canvasPersonalImageHeight);

	try {
		window.whiteboard.paint.updateCorkboard(x, y, canvasPersonalImageWidth, canvasPersonalImageHeight, personalImage, participantsDetailsJSON);
	} catch (e) {}
};

//----------------------------------------------------------------------------
/*
	json = {
		user_id: int,
		...
	}
*/
var onPersonalimages = function(user_id, topic_id, json) {
	if (isEmpty(json)) return;
	if (typeof json === "object") return;
	
	var json = JSON.parse(json);
	
	var participantsDetailsJSON = null;
	for (var ndx = 0, nj = json.length; ndx < nj; ndx++) {
		participantsDetailsJSON = participantsDetails(topic_id, window.participants, json[ndx].id, json[ndx].user_id);
		
		//	lets draw our image for this participant
		if (!isEmpty(participantsDetailsJSON)) {
			updateCorkboard(json[ndx], participantsDetailsJSON);
		}
	}
};
