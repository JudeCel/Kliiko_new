var view = namespace('sf.ifs.View');

/*
	format for the json
	{
		x: int,				//	left position of the playback controller
		y: int,				//	top position of the playback controller
		width: int,			//	used to determine the width of the controller
		height: int,		//	used to determine the height of the controller
		colour: string,		//	base colour
		thisMain: pointer,	//	pointer to the "this" structure in topic.html
		paper: pointer		//	pointer to the canvas we are drawing on
	}
*/
view.Playback = function(json) {
	//	constants
	this.iconWidth = 24;
	this.iconHeight = 30;

	this.json = extend(json);	//	make a copy of this playback
	
	this.isPlaying = true;		//	default to playing
	
	this.rewindToStart	= null;
	this.rewind			= null;
	this.play			= null;
	this.pause			= null;
	this.forward		= null;
	this.forwardToEnd	= null;
	
	this.speed = 1000;	//	default to 1 second
};

view.Playback.prototype.draw = function() {
	//	make sure we remove any old objects first
	if (this.rewindToStart) {
		if (this.rewindToStart[0]) this.rewindToStart.remove()
	};
	
	if (this.rewind) {
		if (this.rewind[0]) this.rewind.remove()
	}
	
	if (this.play) {
		if (this.play[0]) this.play.remove()
	}
	
	if (this.pause) {
		if (this.pause[0]) this.pause.remove()
	}
	
	if (this.forward) {
		if (this.forward[0]) this.forward.remove()
	}
	
	if (this.forwardToEnd) {
		if (this.forwardToEnd[0]) this.forwardToEnd.remove()
	}
	
	var attr = {fill: colourToHex(this.json.colour), stroke: "none", opacity: 0};
	var attrMouseOver = {stroke: "#fff", "stroke-width": 2, opacity: 1};
	var attrMouseOut = {stroke: "none", opacity: 0.1};
	
	//	decide what icons to draw
	this.rewindToStart = this.json.paper.path(getRewindToStartPath());
	this.rewind = this.json.paper.path(getRewindPath());
	this.play = this.json.paper.path(getPlayPath());
	this.pause = this.json.paper.path(getPausePath());
	this.forward = this.json.paper.path(getForwardPath());
	this.forwardToEnd = this.json.paper.path(getForwardToEndPath());
	
	//	move the icons into the correct positions
	this.rewindToStart.translate(this.json.x + (0 * this.iconWidth), this.json.y + ((this.json.height - this.iconHeight) / 2)).attr(attr);	//	me.control[1]
	this.rewind.translate(this.json.x + (1 * this.iconWidth), this.json.y + ((this.json.height - this.iconHeight) / 2)).attr(attr);			//	me.control[2]
	this.play.translate(this.json.x + (2 * this.iconWidth), this.json.y + ((this.json.height - this.iconHeight) / 2)).attr(attr);			//	me.control[3]
	this.pause.translate(this.json.x + (2 * this.iconWidth), this.json.y + ((this.json.height - this.iconHeight) / 2)).attr(attr);			//	me.control[4]
	this.forward.translate(this.json.x + (3 * this.iconWidth), this.json.y + ((this.json.height - this.iconHeight) / 2)).attr(attr);		//	me.control[5]
	this.forwardToEnd.translate(this.json.x + (4 * this.iconWidth), this.json.y + ((this.json.height - this.iconHeight) / 2)).attr(attr);	//	me.control[6]
	
	//	set up icon events
	this.rewindToStart.mouseover(function(mouseOverEvent) {
		this.attr(attrMouseOver);
	});

	this.rewindToStart.mouseout(function(mouseOverEvent) {
		this.attr(attrMouseOut);
	});
	
	this.rewind.mouseover(function(mouseOverEvent) {
		this.attr(attrMouseOver);
	});

	this.rewind.mouseout(function(mouseOverEvent) {
		this.attr(attrMouseOut);
	});
	
	this.play.mouseover(function(mouseOverEvent) {
		this.attr(attrMouseOver);
	});

	this.play.mouseout(function(mouseOverEvent) {
		this.attr(attrMouseOut);
	});

	this.play.click(function() {
		var me = this.data("this");
		
		//	lets swap the play [|>] button for the pause [||] button

		me.playback.isPlaying = true;
		me.json.thisMain.play();
	});

	this.pause.mouseover(function(mouseOverEvent) {
		this.attr(attrMouseOver);
	});

	this.pause.mouseout(function(mouseOverEvent) {
		this.attr(attrMouseOut);
	});

	this.pause.click(function() {
		var me = this.data("this");

		me.playback.isPlaying = false;
		me.json.thisMain.pause();
	});

	this.forward.mouseover(function(mouseOverEvent) {
		this.attr(attrMouseOver);
	});

	this.forward.mouseout(function(mouseOverEvent) {
		this.attr(attrMouseOut);
	});

	this.forwardToEnd.mouseover(function(mouseOverEvent) {
		this.attr(attrMouseOver);
	});

	this.forwardToEnd.mouseout(function(mouseOverEvent) {
		this.attr(attrMouseOut);
	});	
};

view.Playback.prototype.getWidth = function() {
	return (6 * this.iconWidth);
};

view.Playback.prototype.getObjects = function() {
	return [
		this.rewindToStart,
		this.rewind,
		this.play,
		this.pause,
		this.forward,
		this.forwardToEnd
	]
};

view.Playback.prototype.isPlaying = function() {
	return this.isPlaying;
};

view.Playback.prototype.toFront = function() {
	if (!isEmpty(this.rewindToStart)) {
		this.rewindToStart.toFront();
	}

	if (!isEmpty(this.rewind)) {
		this.rewind.toFront();
	}

	if (!isEmpty(this.play)) {
		if (this.isPlaying) {
			this.play.toFront();
		}
	}

	if (!isEmpty(this.pause)) {
		if (!this.isPlaying) {
			this.pause.toFront();
		}
	}

	if (!isEmpty(this.forward)) {
		this.forward.toFront();
	}

	if (!isEmpty(this.forwardToEnd)) {
		this.forwardToEnd.toFront();
	}
};

view.Playback.prototype.toBack = function() {
	if (!isEmpty(this.rewindToStart)) {
		this.rewindToStart.toBack();
	}

	if (!isEmpty(this.rewind)) {
		this.rewind.toBack();
	}

	if (!isEmpty(this.play)) {
		this.play.toBack();
	}

	if (!isEmpty(this.pause)) {
		this.pause.toBack();
	}

	if (!isEmpty(this.forward)) {
		this.forward.toBack();
	}

	if (!isEmpty(this.forwardToEnd)) {
		this.forwardToEnd.toBack();
	}
};

