var view = namespace('sf.ifs.View');

/*
	format for the json
	{
		participants: [
			"name 1",
			"name 2",
			...
		],
		thisMain: pointer,		//	pointer to the "this" structure in topic.html
		paperBehind: pointer,	//	pointer to the area behind the console
		paperInFront: pointer,	//	pointer to the area in front of the console
		paperBubbles: pointer	//	pointer to the area where we display conversations
	}
*/
view.Topic = function(json) {
	this.json = json;
	
	var baseAvatarRadius = 20;
	
	var numberOfParticipants = this.json.participants.length;
	var numberOfActualParticipants = 0;
	for (var ndx = 0; ndx < numberOfParticipants; ndx++) {
		if (!isEmpty(this.json.participants[ndx])) {
			switch(this.json.participants[ndx].role) {
				case 'observer':
				case 'facilitator':
				case 'owner':
				break;
				default: {	//	basically, a participant
					numberOfActualParticipants = numberOfActualParticipants + 1;
				}
				break;
			}
		}
	}
	
	//	on some browsers, this.json.paper.canvas.clientWidth is not set
	var width = this.json.paper.canvas.clientWidth ? this.json.paper.canvas.clientWidth : this.json.paper.width;
	var height = (this.json.paper.canvas.clientHeight ? this.json.paper.canvas.clientHeight : this.json.paper.height);	//	leave a space for the playback controller
	
	//	find the centre of the particpants circle
	var percentageX = 33.3,
		percentageY = 72;
	
	var cx = (width / 100) * percentageX,
		cy = (height / 100) * percentageY;
		
	var radius = 150;
		
	radius = radius - (2 * baseAvatarRadius);
	
	// lets draw our console...
	var consoleJSON = {
		x: cx,
		y: cy,
		radius: radius,
		thisMain: this.json.thisMain,
		paper: this.json.paper
	}
	
	this.console = new sf.ifs.View.Console(consoleJSON);
	this.console.draw();
	
	//	lets adjust where the participants will be drawn
	var circlePath = getEllipseToPath(cx, cy, (radius * 2.25), (radius * 1.0));
	var circle = this.json.paper.path(circlePath).attr({"stroke-opacity": 0});
	
	var circleLength = circle.getTotalLength();
	var halfCircleLength = (circleLength / 2);
	var arcLength = (circleLength / numberOfActualParticipants);
	
	var avatarJSON = {
		userId: -1,
		name: '',
		fullName: '',
		x: 0,
		y: 0,
		radius: baseAvatarRadius,
		orientationHorizontal: "left",
		orientationVertical: "top",
		colour: "black",
		thisMain: this.json.thisMain,
		paper: this.json.paper
	}

	this.avatar = new Array();
	
	//	now lets add the participants
	var point = circle.getPointAtLength(halfCircleLength);	//	start halfway along the ellipse
	var lengthLeft = halfCircleLength;
	var lengthRight = halfCircleLength;
	var lengthABS = halfCircleLength;
	var left = true;
	var showAvatar = true;

	for (var ndx = 0; ndx < numberOfParticipants; ndx++) {
		//	check if this participant is valid
		if (isEmpty(this.json.participants[ndx])) continue;

		avatarJSON.userId = this.json.participants[ndx].user_id;
		avatarJSON.name = this.json.participants[ndx].name;
		avatarJSON.fullName = this.json.participants[ndx].fullName;
		avatarJSON.avatarInfo = this.json.participants[ndx].avatar_info;
        avatarJSON.colour = colourToHex(Number(this.json.participants[ndx].colour));
		avatarJSON.role = this.json.participants[ndx].role;
		avatarJSON.orientationHorizontal = "right";
		if (avatarJSON.x <= cx) avatarJSON.orientationHorizontal = "left";
		avatarJSON.orientationVertical = "top";
		if ((lengthABS * 2) > halfCircleLength) avatarJSON.orientationVertical = "bottom";	//	is our avatar in the bottom half of the console?

		showAvatar = true;

		//	do role specific processing
		switch(avatarJSON.role) {
			case 'facilitator': {
				if ((window.role === 'facilitator') || (window.role === 'owner')) {
					/*
                    avatarJSON.title = "Click to post a message to the billboard";
					avatarJSON.clickEvent = {
						type: "billboard",
						role: 'facilitator'
					}
                    */
                    avatarJSON.title = "";
                    avatarJSON.clickEvent = null;
				} else {
					avatarJSON.title = "Click to send a private mail to " + this.json.participants[ndx].fullName;
					avatarJSON.clickEvent = {
						type: "email",
						to: this.json.participants[ndx].name,
						subject: "Message to " + this.json.participants[ndx].fullName,
						body: "Dear " + this.json.participants[ndx].fullName + ","
					}
				}
				avatarJSON.x = 25;
				avatarJSON.y = 110;

				avatarJSON.orientationHorizontal = "left";
				avatarJSON.orientationVertical = "top";
				avatarJSON.radius = baseAvatarRadius;
				avatarJSON.labelStyle = 'always';
				avatarJSON.colour = 6710886;
			}
			break;
			case 'owner':
			case 'observer': {
				showAvatar = false;
			}
			break;
			default: {	//	basically, a participant
				if ((window.role === 'facilitator') || (window.role === 'owner')) {
					avatarJSON.title = "Click to send a private mail to " + this.json.participants[ndx].fullName;
					avatarJSON.clickEvent = {
						type: "email",
						to: this.json.participants[ndx].name,
						subject: "Message to " + this.json.participants[ndx].fullName,
						body: "Dear " + this.json.participants[ndx].fullName + ",",
						role: 'facilitator'
					}
				} else {
					if (window.username == avatarJSON.name) {
						avatarJSON.clickEvent = {
							type: "avatarchooser"
						}
					} else {
						avatarJSON.clickEvent = null;
					}
				}

				avatarJSON.x = point.x - 55;		//	offsets for new Raphael based avatars
				avatarJSON.y = point.y - 100;
				avatarJSON.radius = baseAvatarRadius;
				avatarJSON.labelStyle = 'offline';

				if (left) {
					lengthLeft = lengthLeft + arcLength;
					point = circle.getPointAtLength(lengthLeft);
					lengthABS = lengthABS - arcLength;
				} else {
					lengthRight = lengthRight - arcLength;
					point = circle.getPointAtLength(lengthRight);
				}

				left = !left;
			}
			break;
		}
		
        if (showAvatar) this.avatar.push(new sf.ifs.View.Avatar(avatarJSON));
	}
	
	//	draw from back to front
	for (var ndx = (this.avatar.length - 1); ndx > -1; ndx--) {
		switch (this.avatar[ndx].json.role) {
			case 'facilitator':
			case 'owner':
				this.avatar[ndx].say("", null);
			break;
			case 'observer':
			break;
			default: {
		        this.avatar[ndx].draw();
			}
		}
	}
};

view.Topic.prototype.getConsole = function() {
	if (isEmpty(this.console)) return null;
	
	return this.console;
};

view.Topic.prototype.getAvatars = function() {
	return this.avatar;
};

view.Topic.prototype.getAvatarByName = function(name) {
	for (var ndx = 0; ndx < this.avatar.length; ndx++) {
		if (this.avatar[ndx].getName() == name) {
			return this.avatar[ndx];
		}
	}
	
	return null;
};

view.Topic.prototype.getAvatarByUserId = function(id) {
	for (var ndx = 0; ndx < this.avatar.length; ndx++) {
		if (this.avatar[ndx].getUserId() === id) {
			return this.avatar[ndx];
		}
	}
	
	return null;
};

view.Topic.prototype.updateParticipants = function(emotion) {
	var avatar = null;
	for (var ndx = 0; ndx < this.json.participants.length; ndx++) {
		if (isEmpty(this.json.participants[ndx])) continue;

		avatar = this.getAvatarByName(this.json.participants[ndx].name);
		if (avatar != null) {
			if (this.json.participants[ndx].online)
				avatar.setEmotion(emotion);
			else
				avatar.setEmotion('offline');

			avatar.draw();
		}
	}
};

//	returns index of the passed 'name', basically it tells us
//	if the passed 'name' is currently online.
//	return null if not online.
view.Topic.prototype.getAvatarIndexByName = function(name) {
	var result = null;

	for (var ndx = 0, pl = this.json.participants.length; ndx < pl; ndx++) {
		if (name === this.json.participants[ndx].name) {
			result = ndx;
			break;
		}
	}
	return result;
};

view.Topic.prototype.getAvatarIndexByIndex = function(index) {
	return this.json.participants[index];
}

view.Topic.prototype.getAvatarIndexByUserId = function(user_id) {
    var result = null;

    for (var ndx = 0, pl = this.json.participants.length; ndx < pl; ndx++) {
        if (user_id === this.json.participants[ndx].user_id) {
            result = ndx;
            break;
        }
    }
    return result;
};

view.Topic.prototype.say = function(name, data) {
	var avatar = this.getAvatarByName(name);
	if (isEmpty(avatar)) return;

	var avatarJSON = avatar.json;

	//	now lets make sure we update the emotion of the avatar
	if (!isEmpty(data.emotion)) {
		avatar.setEmotion(data.emotion);
		avatar.draw();
	}

	for (var ndx = 0, pl = this.json.participants.length; ndx < pl; ndx++) {
		if (avatarJSON.name === this.json.participants[ndx].name) {
			//	first we update the chat history area...
			window.chatHistory.addChat(avatarJSON, data, ndx);

			if (avatarJSON.role === "facilitator") {
				if (!isEmpty(data.mode)) {
					if (data.mode.type === "billboard") {
						avatar.say(data, data.date);
					}
				}
			}
			break;
		}
	}
};

view.Topic.prototype.updateCanvas = function(name, data) {
	thisMain.whiteboard.updateCanvas(name, data);
};

view.Topic.prototype.updateCanvasFromString = function(name, data) {
	dataDecoded = decodeURI(data);
	data = JSON.parse(dataDecoded);

	this.updateCanvas(name, data.object);
};

view.Topic.prototype.updateChatFromString = function(name, data, id, tag, replyId, replyUserId, date, dateReply) {
	if (isEmpty(name) || isEmpty(data) || isEmpty(id) || isEmpty(date)) return;

	dataDecoded = decodeURI(data);
	data = JSON.parse(dataDecoded);
	data.object.id = id;
	data.object.tag = tag;
	data.object.date = date;
	data.object.replyId = replyId;
	data.object.replyUserId = replyUserId;
	data.object.replyDate = dateReply;
	
	if (isEmpty(data.type)) data.type = "text";	//	default to text
	switch(data.type) {
		case "text":
			this.say(data.name, data.object);
		break;
	}
};

view.Topic.prototype.updateConsoleDocumentFromString = function(name, data, date) {
	if (isEmpty(name) || isEmpty(data) || isEmpty(date)) return;

	dataDecoded = decodeURI(data);
	data = JSON.parse(dataDecoded);
};





