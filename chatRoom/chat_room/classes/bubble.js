var view = namespace('sf.ifs.View');

/*
	format for the json
	{
		radius: int,
		avatar: pointer,		//	pointer to the avatar who "owns" this bubble
		colour: int,
		fontSize: int,			//	pt. size of the font
		thisMain: pointer,		//	pointer to the "this" structure in topic.html
		paper: pointer			//	pointer to the canvas we are drawing on
	}
*/
view.Bubble = function(json) {
	this.json = json;
	this.x = 0;
	this.y = 0;
	
	this.avatarbox = null;
	this.bubbleEvent = null;

	//	set up defaults...
	if (!this.json.fontSize) {this.json.fontSize = 12;}

	//	other globals
	this.bubble = this.json.paper.set();
	
	this.bubbleObject = null;
	this.textObject = null;
	this.backObject = null;
	this.nextObject = null;
	this.dateObject = null;
	this.replyObject = null;
	this.linkObject = null;
	this.closeReplyLinkObject = null;
	
	this.chatHistory = new Array();
	
	this.chatHistoryIndex = -1;
	
	this.minimised = false;
	
	this.data = null;
};

view.Bubble.prototype.reset = function() {
	$('#billboardText').innerHTML = "";
	this.data = null;
	this.chatHistory = new Array();
};

var minimiseBubble = function() {
	this.draw({
		minimise:	true
	});
};

/*
json: {
	minimise: boolean,	//	draw this bubble minimised?
}
*/

//	facilitator
//	#f8d2d7	-	fill
//	#ef909d	-	stroke
//	1		-	stroke-width
//	#68524b -	colour of font

view.Bubble.prototype.draw = function(json) {
	var me = this;

	var scale = "s0.6";
	var margin = 20;
	
	var tag = "bubble";
	
	switch (this.json.avatar.json.role) {
		case 'facilitator':
			tag = "?";
		break;
	}	
	
	if (typeof json === "undefined") {
		this.minimised = false;
		json = {
			minimise: false
		}
	};
	
	if (typeof json.minimise === "undefined") {
		this.minimised = false;
		json.minimise = false;
	} else {
		this.minimised = json.minimise;
	}
	
	if (typeof json.replyLink === "undefined") json.replyLink = false;

	//	make sure we remove any old objects first
	if (!isEmpty(this.bubble)) {
		clearTimeout(this.bubbleEvent);
		while (this.bubble.length > 0) {
			try {
				this.bubble.pop().remove();
			} catch (e) {}
		}
	}
	
	//	lets display our text
	if ((this.chatHistory.length > 0) || (json.minimise) || (json.replyLink)) {
		var text = "";
		var colour = this.json.colour;
		if (this.json.avatar.json.role === "facilitator") {
			colour = hexToColour("#68524b");
		}
		
		var sayObject = this.chatHistory[this.chatHistoryIndex];

		if (json.replyLink) {
			colour = json.colour;
			sayObject = json.chatHistory;
		}
		
		if (typeof sayObject.data != "undefined") {
			this.data = sayObject.data;
			
			if (typeof this.data === "object") {
				if (this.json.avatar.json.role === "facilitator") {
					//var billboardText = document.getElementById("billboardText");
					//billboardText.innerHTML = this.data.input;
					//CKEDITOR.instances['billboardEditor'].setData(this.data.input);
				} else {
					text = formatBubbleText(this.data.input, DEFAULT_BUBBLE_ROWS).text;
				}
			}
		}
		
		if (json.minimise) text = "";
		
		if (text != null) {
			//	if we have some text, then lets create our speech bubble
			if (this.json.avatar.json.role === "facilitator") {
				this.bubbleObject = this.json.paper.path(this.getPath({x: 0, y: 0, width: 190, height: 164})).attr({fill: "#f8d2d7", stroke: "#ef909d", 'stroke-width': 1});
			} else { 
				this.bubbleObject = this.json.paper.path(this.getPath(textBBox)).attr({fill: colourToHex(colour), stroke: colourToHex(colour), 'stroke-width': 1});
			}

			//	hover i
			
			this.bubbleObject.data("this", this);
			
			this.bubble.push(
				this.bubbleObject		//	0
				//this.textObject			//	1
			);
		}
	}
};

view.Bubble.prototype.setTextDate = function(data, date) {
	this.chatHistory.push({data: data, date: date.format("ddd HH:MM dd/m")});	//	keep a record of what we have said
	this.chatHistoryIndex = (this.chatHistory.length - 1);	//	make sure we update this
};

view.Bubble.prototype.setText = function(data, dateTime) {
	//	date comes in with the format (yyyy-mm-dd HH:MM:ss)
	//	we want to change this to
	var date = null;

	if (!isEmpty(dateTime)) {
		var dateTimeAsArray = [];
		if (typeof dateTime === "string") {
			dateTimeAsArray = dateTime.split(" ");
		} else {
			dateTimeAsArray = dateTime.format('yyyy-mm-dd HH:MM:ss').split(" ");
		}
		var dateAsArray = dateTimeAsArray[0].split("-");
		var timeAsArray = dateTimeAsArray[1].split(":");
	
		var newDate = new Date(Number(dateAsArray[0]), Number(dateAsArray[1]) - 1, Number(dateAsArray[2]), Number(timeAsArray[0]), Number(timeAsArray[1]), Number(timeAsArray[2]));
		date = newDate.format("ddd HH:MM dd/m");
	}
	this.chatHistory.push({data: data, date: date});	//	keep a record of what we have said
	this.chatHistoryIndex = (this.chatHistory.length - 1);	//	make sure we update this
};

view.Bubble.prototype.getPath = function(textBBox) {
	var offsetX = this.json.radius;
	var offsetY = this.json.radius;
	
	
	var width  = textBBox.width + (this.json.radius * 2);
	var height = textBBox.height + (this.json.radius * 2);
	
	var primaryLocation = "left",
		secondaryLocation = "middle";
	
	//this.y = this.avatarbox.y + offsetY - (height - (this.json.radius * 2));
	//this.y = (this.avatarbox.y + (this.avatarbox.height / 2)) - (width / 2);

	// var leftX = this.avatarbox.x - width - offsetX,
	// 	rightX = this.avatarbox.x + this.avatarbox.width + offsetX;

	var leftX = this.json.avatar.json.x - offsetX,
		rightX = this.json.avatar.json.x + offsetX;

	switch (this.json.avatar.json.role) {
		case 'facilitator': {
			this.x = 130;
			this.y = 93;
			primaryLocation = "left";
			secondaryLocation = "middle";
		}
		break;
		case 'owner': {
			this.x = leftX;
			primaryLocation = "right";
			secondaryLocation = "middle";
		}
		break;
		default: {
			if (this.json.avatar.json.orientationHorizontal == "left") {
				this.x = rightX;
				primaryLocation = "left";
				secondaryLocation = "middle";
			} else {
				this.x = leftX;
				primaryLocation = "right";
				secondaryLocation = "middle";
			}
		}
	}	

	var bubbleJSON = {
		x: this.x,
		y: this.y,
		width: width,
		height: height,
		radius: this.json.radius,
		primaryLocation: primaryLocation,
		secondaryLocation: secondaryLocation
	}
	
	return getSpeechBubblePath(bubbleJSON);
};

view.Bubble.prototype.destroy = function() {
	if (this.bubble) {
		while (this.bubble.length > 0) {
			this.bubble.pop().remove();
		}

		if (this.bubble[0]) {this.bubble.remove();}
	}
	
};

view.Bubble.prototype.setPosition = function(x, y) {
	this.json.avatar.json.x = x;
	this.json.avatar.json.y = y;
};

view.Bubble.prototype.setStrokeColour = function(colour) {
	this.colour.stroke = colour;
};

view.Bubble.prototype.setBackgroundColour = function(colour) {
	this.colour.background = colour;
};

view.Bubble.prototype.setToFront = function() {
	this.draw();
};
