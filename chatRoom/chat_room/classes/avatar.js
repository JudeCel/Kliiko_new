var view = namespace('sf.ifs.View');

/*
	json = {
		userId,							//	avatars Id
		name: string,					//	avatars nickname
		role: string,					//	facilitator | co-facilitator | observer |
		title: string,					//	tooltip
		fullName: string,				//	avatars full name
		avatarInfo: string,				//	holds the DNA of the avatar
		x: int,							//	left position of the avatar
		y: int,							//	top position of the avatar
		radius: int,					//	used to determine the size of the head
		labelStyle: string,				//	normal | always | never
		orientationHorizontal: string,	//	left | right
		orientationVertical: string,	//	top | bottom
		colour: string,					//	base colour
		thisMain: pointer,				//	pointer to the "this" structure in topic.html
		paper: pointer					//	pointer to the canvas we are drawing on
	}
*/
view.Avatar = function(json) {
	this.json = extend(json);	//	make a copy of this avatar

	this.json.x = this.json.x - this.json.radius;
	this.json.y = this.json.y - (2 * this.json.radius);

	switch(this.json.role) {
		case 'facilitator':
		case 'co-facilitator': {
			this.json.colour = avatarColours[8];
			this.bubble = this.createBubble(this.json);
		}
		default:
			this.bubble = null;
		break;
	}

	this.emotion = 'offline';

	if (isEmpty(this.json.labelStyle)) this.json.labelStyle = 'offline';

	this.avatar = null;

	var attributes = this.json.avatarInfo.split(":");


	var avatarJson = {
		x: this.json.x,
		y: this.json.y,
		title: this.json.title,
		attributes: {
			head: attributes[0],
			//	face: attributes[1],
			face: 7,		//	set to offline
			hair: attributes[2],
			top: attributes[3],
			accessory: attributes[4],
			desk: attributes[5],
			name: this.json.fullName,
			colour: this.json.colour
		},
		clickEvent: this.json.clickEvent,
		paper: this.json.paper
	}
	this.manifestation = new sf.ifs.View.AvatarRenderer(avatarJson);

	//this.bubble = new sf.ifs.View.Bubble(jsonBubble);

	// var jsonEmotion = {
	// 	emotion: "offline",
	// 	x: this.json.x + this.json.radius,
	// 	y: this.json.y,
	// 	radius: this.json.radius,
	// 	strokeWidth: 2,
	// 	strokeColour: colourToHex(darkenColour(this.json.colour)),
	// 	paper: this.json.paper
	// }

	//this.emotion = new sf.ifs.View.Emotions(jsonEmotion);
	this.lablel = null;	//	this is used to display the avatars name
};

view.Avatar.prototype.reset = function() {
	//	lets clear out chat history first...
	if (this.bubble) {
        this.bubble.reset();
        this.bubble.setText("", null);
    }
};

view.Avatar.prototype.createBubble = function(json) {
	return new sf.ifs.View.Bubble({
		radius:		5,
		avatar:		this,
    colour:		json.colour,
		fontSize:	10,
		thisMain:	json.thisMain,
    paper:		json.paper
    });
}

view.Avatar.prototype.draw = function() {
	//	make sure we remove any old objects first
	// if (this.avatar) {
	// 	if (this.avatar[0]) this.avatar.remove();
	// }

	//this.avatar = this.json.paper.path(this.getPath()).attr({fill: colourToGradientLighter(this.json.colour), "stroke-opacity": 0});
	this.manifestation.draw();


    //	do we have a bubble?
	if (this.bubble) this.bubble.draw(this.json);
};

view.Avatar.prototype.highlight = function(data, date) {
	this.manifestation.highlight();
};

view.Avatar.prototype.say = function(data, date) {

	if (!this.bubble) {
		this.bubble = this.createBubble(this.json);
	}

	this.bubble.setText(data, date);
	this.draw();

};

// view.Avatar.prototype.getPath = function() {
// 	var d = (this.json.radius * 2);
// 	var r = (this.json.radius / 2);
// 	var rr = (this.json.radius * .75);

// 	result = getRoundedTrapazoidToPath(this.json.paper, this.json.x, (this.json.y + r), (this.json.radius * 1.5), d, d, r);
// 	result = result + getCircleToPath((this.json.x + this.json.radius), this.json.y, rr);

// 	return result;
// };

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	the only way to move a "set" is via the transform method.
//	to make sure we move to an absolute position, I get the current position
//	of our avatar and then work out how far to translate it to our new
//	position
view.Avatar.prototype.setPosition = function(x, y) {
	this.json.x = x;
	this.json.y = y;
};

view.Avatar.prototype.getOnline = function() {
	return this.json.online;
};

view.Avatar.prototype.setOnline = function(value) {
	return this.json.online = value;
};

view.Avatar.prototype.getUserId = function() {
	return this.json.userId;
};

view.Avatar.prototype.getName = function() {
	return this.json.name;
};

view.Avatar.prototype.getFullName = function() {
	return this.json.fullName;
};

view.Avatar.prototype.setStrokeColour = function(colour) {
	this.colour.stroke = colour;
};

view.Avatar.prototype.setBackgroundColour = function(colour) {
	this.colour.background = colour;
};

view.Avatar.prototype.setToFront = function() {
	if (this.avatar) {
		if (this.avatar[0]) this.avatar.toFront();
	}
}

view.Avatar.prototype.getEmotion = function() {
	return this.manifestation.getEmotion();
};

view.Avatar.prototype.setEmotion = function(emotion) {
	if (this.emotion === 'offline') return;

	if (!isEmpty(emotion)) {
		this.manifestation.setEmotion(emotion);
		this.emotion = emotion;
	}
};

view.Avatar.prototype.setCaption = function(caption) {
	this.manifestation.setCaption(caption);
};

view.Avatar.prototype.setEmotionAttribute = function(attribute) {
	// if (this.emotion) {
	// 	this.emotion.json.emotion = emotion;
	// 	this.emotion.draw();
	// }
};
