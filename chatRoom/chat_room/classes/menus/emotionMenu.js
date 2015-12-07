var view = namespace('sf.ifs.View');

/*
	format for the json
	{
		name: string,					//	avatars nickname
		avatarInfo: string,				//	the avatars attributes (colon delimitered)
		fullName: string,				//	avatars full name
		x: int,							//	left position of the avatar
		y: int,							//	top position of the avatar
		radius: int,					//	used to determine the size of the head
		colour: string,					//	base colour
		paper: pointer,					//	pointer to the canvas we are drawing on

		menuRadius:	10
	}
*/
view.EmotionMenu = function(json) {
	this.json = extend(json);	//	make a copy of this avatar
	
	this.json.x = this.json.x - this.json.radius;
	this.json.y = this.json.y - (2 * this.json.radius);
	
	this.emotion = 'normal';
	this.avatar = null;

	// var jsonEmotion = {
	// 	emotion: "offline",
	// 	x: this.json.x + this.json.radius,
	// 	y: this.json.y,
	// 	radius: this.json.radius,
	// 	strokeWidth: 2,
	// 	strokeColour: colourToHex(darkenColour(this.json.colour)),
	// 	paper: this.json.paper
	// }
	// this.emotion = new sf.ifs.View.Emotions(jsonEmotion);
	
	this.emotionMenu = this.json.paper.set();

	this.getTextFieldSize();
};

view.EmotionMenu.prototype.draw = function() {
	//-------------------------------------------------------------------------
	//	make sure we remove any old objects first
	if (this.avatar) {
		for (var ndxOuter = 0, nco = this.avatar.length; ndxOuter < nco; ndxOuter++) {
			for (var ndxInner = 0, nci = this.avatar[ndxOuter].length; ndxInner < nci; ndxInner++) {
				if (this.avatar[ndxOuter][ndxInner]) {
					if (!this.avatar[ndxOuter][ndxInner].removed) {
						this.avatar[ndxOuter][ndxInner].remove();
					}
				}
			}
		}
	}
	
	this.avatar = this.json.paper.set();

	//-------------------------------------------------------------------------
	//this.avatar = this.json.paper.path(getAvatarIcon(this.json.paper,this.json.radius,this.json.x,this.json.y)).attr({fill: colourToGradientLighter(this.json.colour), "stroke-opacity": 0});
	//lets draw our avatar here...


	//	OK, the row has been added.  Lets draw our character (Raphael) into this row
	var attributes = this.json.avatarInfo.split(":");
	//var paperAvatar = Raphael(avatarId);
	this.json.paper.setViewBox(10, 10, 100, 70, false);
	var head = heads[attributes[0]](this.json.paper);


	var emotion = 7;	//	default
	switch(this.emotion) {
		case "smiling": 
			emotion = 2;
			break;
		case "upset":
			emotion = 5;
			break;
		case "normal":
			emotion = 4;
			break;
		case "angry":
			emotion = 0;
			break;
		case "love":
			emotion = 3;
			break;
		case "confused":
			emotion = 1;
			break;
		case "surprised":
			emotion = 6;
			break;
		case "offline": 
		default:
			break;
	}

	var face = faces[emotion](this.json.paper);

	var hair = hairs[attributes[2]](this.json.paper);
	var accessory = accessories[attributes[4]](this.json.paper);
	var top = tops[attributes[3]](this.json.paper);

	this.avatar.push(
		head,
		face,
		hair,
		top,
		accessory
	);

	//-------------------------------------------------------------------------
	// this.avatar.data("this", this);
	// this.avatar.showMenu=false;
	// if (this.emotion) this.emotion.draw();
	// this.avatar.data("this",this);
	// this.avatar.click(function(){
	// 	window.dashboard.setEmotion();
	// 	window.dashboard.toFront();
	// 	window.dashboard.close();
	// });
};

view.EmotionMenu.prototype.getTextFieldSize=function(){
	this.TextOrgWidth=parseInt(document.getElementById("chatTextBox").style.width);
	this.TextOrgLeft=parseInt(document.getElementById("chatTextBox").style.left);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	the only way to move a "set" is via the transform method.
//	to make sure we move to an absolute position, I get the current position
//	of our avatar and then work out how far to translate it to our new
//	position
view.EmotionMenu.prototype.setPosition = function(x, y) {
	this.json.x = x;
	this.json.y = y;
};

view.EmotionMenu.prototype.getName = function() {
	return this.json.name;
};

view.EmotionMenu.prototype.getFullName = function() {
	return this.json.fullName;
};

view.EmotionMenu.prototype.setStrokeColour = function(colour) {
	this.colour.stroke = colour;
};

view.EmotionMenu.prototype.setBackgroundColour = function(colour) {
	this.colour.background = colour;
};

view.EmotionMenu.prototype.setEmotion = function(emotion) {
	if (this.emotion) {
		this.emotion = emotion;
		// this.emotion.json.emotion = emotion;
		this.draw();
	}
}
view.EmotionMenu.prototype.getEmotion = function(){
	return this.emotion;
}

