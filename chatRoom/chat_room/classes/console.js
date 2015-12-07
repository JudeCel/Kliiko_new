var view = namespace('sf.ifs.View');

window.CS_NONE = 0;
window.CS_VIDEO = 1;
window.CS_AUDIO = 2;
window.CS_PICTUREBOARD = 4;
window.CS_VOTE = 8;

/*
	format for the json
	{
		x: int,						//	left position of the avatar
		y: int,						//	top position of the avatar
		radius: int,				//	used to determine the size of the head
		thisMain: pointer,		//	pointer to the "this" structure in topic.html
		paper: pointer				//	pointer to the canvas we are drawing on
	}
*/
view.Console = function(json) {
	this.json = json;
	this.console = this.json.paper.set();
	this.consoleDocumentId = null;
	this.consoleDocumentVoteId = null;
	this.consoleDocument = null;	//	this is where we store the document
	this.consoleDocumentVote = null;

	this.target = {					//	specifies the area to highlight when dragging
		target:	"console",
		x:		0,
		y:		0,
		width: 	0,
		height:	0
	};

	window.consoleState = CS_NONE;
};

view.Console.prototype.draw = function() {
	if (this.console) {
		if (this.console[0]) this.console.remove();
	}
	
	consoleObjectList = [
		"video",
		"audio",
		"image",
		"vote"
	];
	
	var radius = 10,
		gap = 10,
		controlWidth = 40,
		numberOfControls = 4,	//	image, video, audio & voting
		width = (numberOfControls * controlWidth) + ((numberOfControls + 1) * gap),
		height = 50;
		
	//	specifies the area to highlight when dragging
	this.target = {
		target:	"console",
		x: 		this.json.x - (width / 2),
		y: 		this.json.y - height,
		width: 	width,
		height: height 
	};
		
	//	lets draw the background of our console first
	var console = this.json.paper.path(getRoundedRectToPath(
		this.target.x,
		this.target.y,
		this.target.width,
		this.target.height,
		radius
	)).attr({
		fill: '90-#bdb2b0-#dbd6d2',
		stroke: '#dbd6d2',
		'stroke-width': 2
	});
	
	this.console.push(console);

	//	OK, lets draw the background circles for the control images to be "placed in"
	var cx = this.target.x + (controlWidth / 2) + gap;
	var cy = this.target.y + (controlWidth / 2) + ((height - controlWidth) / 2);
	
	this.globals = {
		cx: cx,
		cy: cy,
		width: controlWidth,
		gap: gap
	};
	
	for (var controlNdx = 0; controlNdx < numberOfControls; controlNdx++) {
		var circle = this.json.paper.circle(cx, cy, (controlWidth / 2)).attr({
			fill: '270-#bdb2b0-#dbd6d2',
			stroke: 'none',
			'stroke-width': 0
		});
		
		this.console.push(circle);
		
		var consoleObjectUnselectedPath = window.URL_PATH + window.CHAT_ROOM_PATH + "resources/images/" + consoleObjectList[controlNdx] + "_off.png";
		var consoleObjectSelectedPath = window.URL_PATH + window.CHAT_ROOM_PATH + "resources/images/" + consoleObjectList[controlNdx] + "_on.png";

		var consoleObjectUnselected = this.json.paper.image(consoleObjectUnselectedPath, cx - 17, cy -17, 34, 34);
		var consoleObjectSelected = this.json.paper.image(consoleObjectSelectedPath, cx - 17, cy -17, 34, 34).attr({title: consoleObjectList[controlNdx], opacity: 0});
		
		consoleObjectSelected.data("this", this);
		consoleObjectSelected.click(function() {
			var me = this.data("this");
			if (me.isConsoleElement({elementName: this.attr().title})) {
				//alert(this.attr().title.capitalise());
				
				switch(this.attr().title) {
					case "image":
						if (window.role != "observer") {
							window.handleConsoleImage();
						}
					break;
					case "video":
						window.handleConsoleVideo();
					break;
					case "audio":
						window.handleConsoleAudio();
					break;
					case "vote":
						window.handleConsoleVote();
					break;
				}
			}
		});

		this.console.push(consoleObjectUnselected);
		this.console.push(consoleObjectSelected);
		
		cx = cx + controlWidth + gap;
	}
	
};

/*
	json = {
		elementName: string,		"image" | "video" | "audio" | "vote"
		isOn: boolean				false = off | true = on
	}
*/
view.Console.prototype.setConsoleElement = function(json) {
	var currentObject = null;
	for (var ndx = 0, nc = this.console.length; ndx < nc; ndx++) {
		currentObject = this.console[ndx];
		if (currentObject.type === "image") {
			if (currentObject.attr().title === json.elementName) {
				if (json.isOn) {
					currentObject.attr({opacity: 1});
				} else {
					currentObject.attr({opacity: 0});
				}
			}
		}
	}
};

/*
	json = {
		elementName: string			"image" | "video" | "audio" | "vote"
	}

	returns true if the element is currently "on", otherwise returns false
*/
view.Console.prototype.isConsoleElement = function(json) {
	var result = false;
	
	var currentObject = null;
	for (var ndx = 0, nc = this.console.length; ndx < nc; ndx++) {
		currentObject = this.console[ndx];
		if (currentObject.type === "image") {
			if (currentObject.attr().title === json.elementName) {

				result = (currentObject.attr().opacity === 1);
			}
		}
	}
	
	return result;
};

view.Console.prototype.processRadioForm = function(jsonAsString) {
	var json = JSON.parse(jsonAsString);
	var question = json.question;
	var answers = document.forms[json.form_id].elements[json.element_id];
	var answer = null;

	for (var ndx = 0, al = answers.length; ndx < al; ndx++) {
		if (answers[ndx].checked) {
			answer = answers[ndx].value;
			break;
		}
	}
	
	//	if we have everything, lets save this
	if (!isEmpty(answer)) {
		var voteAsString = JSON.stringify({
			question: question,
			answer: answer
		}, null);
		
		thisMain.sendMessage({
			type:	"vote",
			message: voteAsString
		});
	}

	window.dashboard.toBack();
};

view.Console.prototype.processFreeTextForm = function(jsonAsString) {
	var json = JSON.parse(jsonAsString);
	var question = json.question;
	var answer = document.getElementById(json.element_id).value;

	//	if we have everything, lets save this
	if (!isEmpty(answer)) {
		var voteAsString = JSON.stringify({
			question: question,
			answer: answer
		}, null);
		
		thisMain.sendMessage({
			type:	"vote",
			message: voteAsString
		});
	}

	window.dashboard.toBack();
};

//----------------------------------------------------------------------------
view.Console.prototype.processForm = function(json) {
	var voteAsString = JSON.stringify(json, null);

	thisMain.sendMessage({
		type:	"vote",
		message: voteAsString
	});

	window.dashboard.toBack();
};

/*
	json = {
		style: string,		//	'Yes / No' | 'Yes / No / Unsure' | 'Free Text' | 'Star Rating (out of 5)'
		question: string	//	question to ask in form
	}
*/
view.Console.prototype.getForm = function(json) {
	var html = null;

	var getYesNoForm = function() {
		return null;
	};

	var getYesNoUnsureForm = function() {
		return null;
	};

	var getFreeTextForm = function() {
		return	'<div style="position:relative; left:0px; top:0px; width:0px; height: 0px;">' +
				'	<div style="position:absolute; left: 30px; top:260px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
				'		<textarea name="taFreeText" id="taFreeText" rows="8" cols="80" style="resize: none;"></textarea>' +
				'	</div>' +
				'</div>';
	};

	var getStarRatingForm = function() {
		return null;
	};
	
	//------------------------------------------------------------------------
	switch(json.style) {
		case 'YesNo': {
			html = getYesNoForm();
		}
		break;
		case 'YesNoUnsure': {
			html = getYesNoUnsureForm();
		}
		break;
		case 'FreeText': {
			html = getFreeTextForm();
		}
		break;
		case 'StarRating': {
			html = getStarRatingForm();
		}
		break;
	}
	
	return html;
};

//----------------------------------------------------------------------------
/*
	json = {
		id: int,
		updateEvent: boolean,		//	{default: true}	do we need to call updateEvents(...)?
		type: string,				//	"video" || "audio" || "image" || "vote"
		content: string				//	content for video, audio or vote
									//	image - "true" || "false" || "toggle" || "none" 
									//			(show pictureboard || hide pictureboard || toggle pictureboard || don't touch the console or picturboard)
	}


	O : This console element is on
	X : This was dragged (or turned on in the case of the Pictureboard)
	V : Video column
	A : Audio column
	P : Pictureboard column
	v : Vote column

	   +---+---+---+---+     +---+---+---+---+
	   | V | A | P | v |     | V | A | P | v |
	   +---+---+---+---+     +---+---+---+---+
	 a | X |   |   |   |     | O |   |   |   | <- *
	   +---+---+---+---+     +---+---+---+---+
	 b |   | X |   |   |     |   | O |   |   |
	   +---+---+---+---+     +---+---+---+---+
	 c |   |   | X |   |     |   |   | O |   |
	   +---+---+---+---+     +---+---+---+---+
	 d |   |   |   | X |     |   |   |   | O |
	   +---+---+---+---+     +---+---+---+---+
	 e | X | O |   |   |     | O |   |   |   | <- **
	   +---+---+---+---+     +---+---+---+---+
	 f | X |   | O |   |     | O |   | O |   | <- ***
	   +---+---+---+---+     +---+---+---+---+
	 g | X |   |   | O |     | O |   |   |   |
	   +---+---+---+---+     +---+---+---+---+
	 h | O | X |   |   | --> |   | O |   |   |
	   +---+---+---+---+     +---+---+---+---+
	 i |   | X | O |   |     |   | O | O |   |
	   +---+---+---+---+     +---+---+---+---+
	 j |   | X |   | O |     |   | O |   |   |
	   +---+---+---+---+     +---+---+---+---+
	 k | O |   | X |   |     |   |   | O |   |
	   +---+---+---+---+     +---+---+---+---+
	 l |   | O | X |   |     |   |   | O |   |
	   +---+---+---+---+     +---+---+---+---+
	 m |   |   | X | O |     |   |   | O |   |
	   +---+---+---+---+     +---+---+---+---+
	 n | O |   |   | X |     | O |   |   | O |
	   +---+---+---+---+     +---+---+---+---+
	 o |   | O |   | X |     |   | O |   | O |
	   +---+---+---+---+     +---+---+---+---+
	 p |   |   | O | X |     |   |   | O | O | <- ****
	   +---+---+---+---+     +---+---+---+---+


	*		in this example (row a), the console was empty, dragging a Video turns the Video light on
	**		in this example (row e), the console had the Audio light on, dragging a Video turns the Video light on and the Audio off
	***		in this example (row f), the console had the Pinboard light on, dragging a Video turns on the Video light and leaves the Pinboard light on
	****	in this example (row p), the console had the Image light on, dragging a Vote turns the Vote light on and leaves the Image light on

	Basically, rows (a - m) are AND operations, (n - p) or OR operations
*/
view.Console.prototype.setConsole = function(json) {
	//	lets make sure our json is valid
	if (isEmpty(json)) return;
	if (isEmpty(json.type)) return;
	if (isEmpty(json.content)) return;

	var lastConsoleState = window.consoleState;
	var consoleState = CS_NONE;

	//	set up defaults
	if (isEmpty(json.id)) json.id = -1;

	switch (json.type) {
		case "null":
			consoleState = CS_NONE; 
			this.consoleDocument = null;
			break;
		case "video":
			if ((window.consoleState & CS_PICTUREBOARD) === CS_PICTUREBOARD) {
				consoleState = (CS_VIDEO + CS_PICTUREBOARD); 
			} else {
				consoleState = CS_VIDEO; 
			}
            if ((window.consoleState & CS_VOTE) === CS_VOTE)
                consoleState += CS_VOTE;
			this.consoleDocument = json.content;
			break;
		case "audio":
			if ((window.consoleState & CS_PICTUREBOARD) === CS_PICTUREBOARD) {
				consoleState = (CS_AUDIO + CS_PICTUREBOARD); 
			} else {
				consoleState = CS_AUDIO; 
			}
            if ((window.consoleState & CS_VOTE) === CS_VOTE)
                consoleState += CS_VOTE;
			this.consoleDocument = json.content;
			break;
		case "image":
			//	if the picture board is present, lets get rid of it...
			if (window.consoleState & CS_PICTUREBOARD) {
				consoleState = CS_NONE;
			}

			break;
		case "pictureboard": {
			consoleState = window.consoleState;

			switch (json.content) {
				case "true":
					//	lets turn the picture board on
					if ((window.consoleState & CS_PICTUREBOARD) === 0) consoleState = (window.consoleState + CS_PICTUREBOARD); 
				break;
				case "toggle":
					if ((window.consoleState & CS_PICTUREBOARD) === 0) {
						consoleState = (window.consoleState + CS_PICTUREBOARD);
					} else {
						consoleState = (window.consoleState - CS_PICTUREBOARD);	
					}
				break;
				case "none":
				break;
				default:
					//	lets turn the picture board off
					if ((window.consoleState & CS_PICTUREBOARD) === CS_PICTUREBOARD) consoleState = (window.consoleState - CS_PICTUREBOARD); 
				break;
			}
		}
			break;
		case "vote":
            consoleState = window.consoleState;
			if ((window.consoleState & CS_VOTE) === 0) consoleState = (window.consoleState + CS_VOTE); 

			this.consoleDocumentVoteId = json.id;	//	we don't want to overwrite this.consoleDocumentId
			this.consoleDocumentVote = json.content;

			break;
	}
    if(window.topicID == null)
        return;
	window.consoleState = consoleState;

	//	lets update all the consoles
	socket.emit('updateconsole', json, window.topicID, consoleState, lastConsoleState);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*
	json = {
		//	data used for displaying the images on the pictureboard
		//	it will be in a stringify state as well
		//	see onPersonalImages.js for the format
	}
*/
view.Console.prototype.updateConsole = function(console_state, json) {
	if (typeof console_state === "undefined") return;
	if (typeof json === "undefined") return;

	//	lets update our consoleState
	var lastConsoleState = window.consoleState;
	window.consoleState = console_state;

	//	now lets turn on the various lights on the console
	this.setConsoleElement({elementName: "video", isOn: (window.consoleState & CS_VIDEO)});
	this.setConsoleElement({elementName: "audio", isOn: (window.consoleState & CS_AUDIO)});
	this.setConsoleElement({elementName: "image", isOn: (window.consoleState & CS_PICTUREBOARD)});
	this.setConsoleElement({elementName: "vote", isOn: (window.consoleState & CS_VOTE)});

	//	do we show or hide the pictureboard?
	if (window.consoleState & CS_PICTUREBOARD) {
		if (lastConsoleState & CS_PICTUREBOARD) window.whiteboard.paint.corkboardToBack();
		window.whiteboard.paint.corkboardToFront();
		onPersonalimages(null, null, json);
	} else {
		//	lets hide the corkboard
		window.whiteboard.paint.corkboardToBack();

		if (!isEmpty(json.type)) {
			switch(json.type) {
				// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
				//	video
				/*
					json = {
						type: string,				//	"video"
						id: int,					//	ID of the event
						userID: int,				//	ID of the user who created the message
						content: string,			//	HTML to inject into the right <DIV></DIV>
						target: string				//	"console"
					}
				*/
				case 'video': {
					if (isEmpty(json.userID)) return;				//	we don't know who sent this, so lets leave...
					if (json.userID === window.userID) return;		//	this has already been processed

					if (isEmpty(json.target)) json.target = "console";

					this.consoleDocument = json.content;
					//this.consoleDocumentVoteId = -1;
					//this.consoleDocumentVote = null;
				}
				break;

				// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
				//	audio
				/*
					json = {
						type: string,				//	"audio"
						id: int,					//	ID of the event
						userID: int,				//	ID of the user who created the message
						content: string,			//	HTML to inject into the right <DIV></DIV>
						target: string				//	"console"
					}
				*/
				case 'audio': {
					if (isEmpty(json.userID)) return;				//	we don't know who sent this, so lets leave...
					if (json.userID === window.userID) return;		//	this has already been processed

					if (isEmpty(json.target)) json.target = "console";

					this.consoleDocument = json.content;
					//this.consoleDocumentVoteId = -1;
					//this.consoleDocumentVote = null;
				}
				break;

				// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
				//	image
				/*
					json = {
						type: string,				//	"image"
						id: int,					//	ID of the event
						userID: int,				//	ID of the user who created the message
						actualSize: {
							width: float,
							height: float			//	original size of the image
						},
						content: string,			//	URL of the image
						target: string				//	"whiteboard"
					}
				*/
				case 'image': {
					//	need to hide the pictureboard
					if (lastConsoleState & CS_PICTUREBOARD) window.whiteboard.paint.corkboardToBack();

					//	lets process our image
					if (isEmpty(json.userID)) return;				//	we don't know who sent this, so lets leave...
					if (json.userID === window.userID) return;		//	this has already been processed

					if (isEmpty(json.target)) json.target = "whiteboard";

					window.whiteboard.paint.setImage(json);
				}
				break;

				// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
				//	vote
				/*
					json = {
						type: string,				//	"audio"
						id: int,					//	ID of the event
						userID: int,				//	ID of the user who created the message
						content: string,			//	HTML to inject into the right <DIV></DIV>
						target: string				//	"console"
					}
				*/
				case 'vote': {
					if (isEmpty(json.userID)) return;				//	we don't know who sent this, so lets leave...
					if (json.userID === window.userID) return;		//	this has already been processed

					if (isEmpty(json.target)) json.target = "console";

					this.consoleDocument = null;
					this.consoleDocumentVoteId = json.id;
					this.consoleDocumentVote = json.content;
				}
				break;

				default:
					//	need to hide the pictureboard
					if (lastConsoleState & CS_PICTUREBOARD) window.whiteboard.paint.corkboardToBack();
				break;
			}
		} else {
			//	need to hide the pictureboard
			if (lastConsoleState & CS_PICTUREBOARD) window.whiteboard.paint.corkboardToBack();
		}
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Console.prototype.unsetDocument = function() {
	if (!isEmpty(this.consoleDocument)) {
		while (this.consoleDocument.length > 0) {
			this.consoleDocument.pop().remove();
		}
	}	
	if (!isEmpty(this.consoleDocumentVote)) {
		while (this.consoleDocumentVote.length > 0) {
			this.consoleDocumentVote.pop().remove();
		}
	}
};

//----------------------------------------------------------------------------
//	get the target area for the console
view.Console.prototype.getTargetAsJSON = function() {
	return this.target;
};

