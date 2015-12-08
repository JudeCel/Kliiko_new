var view = namespace('sf.ifs.View');

/*
	format for the json
	{
		emotion: string,		//	'offline' | 'normal' | 'smiling' | 'upset' | 'angry'
		x: int,					//	left position of the emotion
		y: int,					//	top position of the emotion
		radius: int,			//	radius of the avatars head
		strokeWidth: float,		//	width of the line we draw
		strokeColour: string,	//	line colour
		paper: pointer			//	pointer to the canvas we are drawing on
	}
*/
view.Emotions = function(json) {
	this.json = json;
	
	this.emotion = null;
};

view.Emotions.prototype.draw = function() {
	//	make sure we remove any old objects first
	if (this.emotion) {
		if (this.emotion[0]) this.emotion.remove();
	}
	this.emotion = this.json.paper.set();
	
	this.emotion = this.drawEmotion(this.json.emotion, this.emotion);
};

view.Emotions.prototype.drawEmotion = function(emotion, emotionSet) {
	//	we want to divide the avatars head into sections, each section is 1/4th of the radius
	//	we can then create place the eyes, mouth and eyebrows in the correct places
	var scale = (this.json.radius / 25);
	var centerX = 0,
		centerY=0;

	switch(emotion) {
		case "smiling": 
			var result = getSmilingFace(this.json.paper,emotionSet,this.json.strokeColour);
			emotionSet = result["set"];
			centerX = result["centerX"];
			centerY = result["centerY"];
			break;
		case "upset":
			var result = getUpsetFace(this.json.paper,emotionSet,this.json.strokeColour);
			emotionSet = result["set"];
			centerX = result["centerX"];
			centerY = result["centerY"];
			break;
		case "normal":
			var result = getNormalFace(this.json.paper,emotionSet,this.json.strokeColour);
			emotionSet = result["set"];
			centerX = result["centerX"];
			centerY = result["centerY"];
			break;
		case "angry":
			var result = getAngryFace(this.json.paper,emotionSet,this.json.strokeColour);
			emotionSet = result["set"];
			centerX = result["centerX"];
			centerY = result["centerY"];
			break;
		case "love":
			var result = getLoveFace(this.json.paper,emotionSet,this.json.strokeColour);
			emotionSet = result["set"];
			centerX = result["centerX"];
			centerY = result["centerY"];
			break;
		case "confused":
			var result = getConfusedFace(this.json.paper,emotionSet,this.json.strokeColour);
			emotionSet = result["set"];
			centerX = result["centerX"];
			centerY = result["centerY"];
			break;
		case "surprised":
			var result = getSurprisedFace(this.json.paper,emotionSet,this.json.strokeColour);
			emotionSet = result["set"];
			centerX = result["centerX"];
			centerY = result["centerY"];
			break;
		case "offline": 
		default:
			var result = getOfflineFace(this.json.paper,emotionSet,this.json.strokeColour);
			emotionSet = result["set"];
			centerX = result["centerX"];
			centerY = result["centerY"];
			break;
	}
		
	emotionSet.transform("t" + (this.json.x - centerX + (this.json.radius / 2)) + " " + (this.json.y - centerY + (this.json.radius / 2)) + " s" + scale + " " + scale + " " + centerX + " " + centerY).attr({"opacity": 1});
	return emotionSet;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	the only way to move a "set" is via the transform method.
//	to make sure we move to an absolute position, I get the current position
//	of our emotion and then work out how far to translate it to our new
//	position
view.Emotions.prototype.setPosition = function(x, y) {
	this.json.x = x;
	this.json.y = y;
};

view.Emotions.prototype.getOnline = function() {
	return this.json.online;
};

view.Emotions.prototype.setOnline = function(value) {
	return this.json.online = value;
};

view.Emotions.prototype.getName = function() {
	return this.json.name;
};

view.Emotions.prototype.getFullName = function() {
	return this.json.fullName;
};

view.Emotions.prototype.setStrokeColour = function(colour) {
	this.colour.stroke = colour;
};

view.Emotions.prototype.setBackgroundColour = function(colour) {
	this.colour.background = colour;
};

view.Emotions.prototype.setToFront = function() {
	if (this.emotion) this.emotion.toFront();
}