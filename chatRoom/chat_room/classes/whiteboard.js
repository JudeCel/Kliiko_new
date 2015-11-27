var view = namespace('sf.ifs.View');

/*
	json = {
		enabled: boolean,		//	default false
		showControls: boolean,	//	default false
		scale: float,			//	default (316 / 950)
		actualScale: float,		//	default 1.0
		onClick: pointer,
		zIndex: int,			//	default 0
		board: {
			strokeWidth: int,		//	default 1
			radiusInner: int,
			radiusOuter: int,
			paper:	pointer
		},
		canvas: {
			x: int,
			y: int,
			width: int,
			height: int,
			paper:	pointer
		},
		icon: {
			paper:	pointer
		},
		thisMain: pointer		//	needed for paint, hopefully we can remove this soon
	}
*/
view.Whiteboard = function(json) {
	var paintJSON = {
		scale: 		json.scale, 		//	default to small scale
		thisMain: 	json.thisMain,
		paper: 		json.canvas.paper
	}
	
	this.paint = new sf.ifs.View.Paint(paintJSON);
	
	this.target = {					//	specifies the area to highlight when dragging
		target:			"whiteboard",
		x:				0,
		y:				0,
		width: 			0,
		height:			0
	}	

	this.initialise(json);

	this.icons = new Array();
};

view.Whiteboard.prototype.initialise = function(json) {	
	this.json = json;
	
	//	lets make sure we update our target
	this.target.x = this.json.canvas.x;
	this.target.y = this.json.canvas.y;
	this.target.width = this.json.canvas.width;
	this.target.height = this.json.canvas.height;
	
	//	make sure our defaults are set up
	if (typeof this.json.enabled === "undefined") this.json.enabled = false;
	if (typeof this.json.showControls === "undefined") this.json.showControls = false;
	if (typeof this.json.scale === "undefined") this.json.scale = (window.whiteboardSmall.width / window.whiteboardLarge.width);
	if (typeof this.json.actualScale === "undefined") this.json.actualScale = 1.0;
	if (typeof this.json.zIndex === "undefined") this.json.zIndex = 0;
	if (typeof this.json.board.strokeWidth === "undefined") this.json.board.strokeWidth = 1;
	if (typeof this.json.board.radiusInner === "undefined") this.json.board.radiusInner = 5;
	if (typeof this.json.board.radiusOuter === "undefined") this.json.board.radiusOuter = 5;

	if (this.whiteboard) {
		if (this.whiteboard[0]) this.whiteboard.remove();
	}
	this.whiteboard = null;

	var paintJSON = {
		scale: 			this.json.scale, 		//	default to small scale
		actualScale:	this.json.actualScale,
		thisMain: 		this.json.thisMain,
		paper: 			this.json.canvas.paper
	}
	
	this.paint.setJSON(paintJSON);			//	I don't think this is used
};

view.Whiteboard.prototype.draw = function() {
	var isBig = (this.json.canvas.width > 500);
	
	var divWhiteboard = document.getElementById("whiteboard");
	divWhiteboard.style.zIndex = this.json.zIndex;
	
	var divCanvas = document.getElementById("canvas");
	divCanvas.style.left = "" + this.json.canvas.x + "px";
	divCanvas.style.top = "" + this.json.canvas.y + "px";
	
	this.json.canvas.paper.changeSize(this.json.canvas.width, this.json.canvas.height);
	
	if (this.whiteboard) {
		if (this.whiteboard[0]) this.whiteboard.remove();
	}
	this.whiteboard = null;
	
	//	lets create a countainer for our whiteboard
	this.whiteboard = this.json.board.paper.set();

	var controlHeight = (this.json.showControls) ? 86 : 0;
	
	//	first lets create our whiteboard frame...
	var boarder = this.json.board.paper.path(getRoundedRectToPath(
		this.json.canvas.x - this.json.board.radiusOuter, 
		this.json.canvas.y - this.json.board.radiusOuter, 
		this.json.canvas.width + (2 * this.json.board.radiusOuter), 
		this.json.canvas.height + (2 * this.json.board.radiusOuter) + controlHeight, 
		this.json.board.radiusOuter
	)).attr({fill: WHITEBOARD_BACKGROUND_COLOUR, stroke: WHITEBOARD_BORDER_COLOUR, "stroke-width": 1});
	
	var drawingFrame = this.json.board.paper.path(getRoundedRectToPath(
		this.json.canvas.x, 
		this.json.canvas.y, 
		this.json.canvas.width, 
		this.json.canvas.height, 
		this.json.board.radiusInner
	)).attr({fill: "#fff", stroke: WHITEBOARD_BORDER_COLOUR, "stroke-width": this.json.board.strokeWidth});
	
	var titleY = -21;
	if (isBig) titleY = -28
		
	var title = paperTitleWhiteboard.image(
		window.URL_PATH + window.CHAT_ROOM_PATH + "resources/images/title_whiteboard.png",
		//this.json.canvas.x + 20,
		//this.json.canvas.y + titleY,
		0,
		0,
		85,
		30
	);
	
	var icon = null;
	if (isBig) {
		//	icon to shrink the whiteboard
		icon = this.json.icon.paper.image(
			window.URL_PATH + window.CHAT_ROOM_PATH + "resources/images/icon_whiteboard_shrink.png",
			0,
			0,
			51,
			51
		).attr({title: 'Shrink the Whiteboard'});

		icon.data("this", this);
		icon.click(function() {
			var me = this.data("this");

			//	call the following from paintUtilities
			hideFreeTransformToObjects(me.paint.paint.paper);

			//	I don't know why, but it just seems "paint" needs to be in front to perform correctly
			me.paint.paint.toFront();
			if (!isEmpty(me.json.onClick)) me.json.onClick("shrink");	//	onParticipants.whiteboardClick
		});
	} else {
		//	icon to expand the whiteboard
		icon = this.json.icon.paper.image(
			window.URL_PATH + window.CHAT_ROOM_PATH + "resources/images/icon_whiteboard_expand.png",
			0,
			0,
			36,
			36
		).attr({title: 'Expand the Whiteboard'});
		
		icon.data("this", this);
		icon.click(function() {
			var me = this.data("this");
			if (!isEmpty(me.json.onClick)) me.json.onClick("expand");	//	onParticipants.whiteboardClick
		});
	}
	
	icon.attr({"opacity": 1.0});

	this.whiteboard.push(
		boarder,
		drawingFrame,
		title,
		icon
	);

	if (this.json.showControls) {
		this.whiteboard.push(this.controls());
	}
};

view.Whiteboard.prototype.updateJSON = function(json) {
	this.initialise(json);
	this.paint.poplist.clearPoplist();
	this.paint.poplist.types = null;
};

view.Whiteboard.prototype.updateCanvas = function(name, data, removeDragEvents) {
	if (isEmpty(removeDragEvents)) removeDragEvents = false;

	if (!isEmpty(this.paint)) {
		this.paint.updateCanvas(name, data, removeDragEvents);
	};
};

view.Whiteboard.prototype.updateEvent = function(topicid, data) {
	this.paint.updateEvent(topicid, data);
};

view.Whiteboard.prototype.updateUndo = function(eventid,username,topicid,data){
	//this.paint.updateUndo(eventid, username, topicid, data);
};
view.Whiteboard.prototype.updateRedo = function(eventid,username,topicid,data){
	//this.paint.updateRedo(eventid, username, topicid, data);
};

view.Whiteboard.prototype.controls = function() {
	var eraseJSON = {
		id: "Erase",
		title: "Eraser",
		icons: [{
			id: "EraseOne",
			title: "Erase one object at a time"
		}, {
			id: "EraseAll",
			role: "facilitator",
			title: "Clear the Whiteboard"
		}]
	}

	if (window.role === 'participant') {
		eraseJSON = {
			id: "EraseOne",
			title: "Erase one object at a time",
			transformY: 3
		}
	}

	buttonsJSON = {
		position: {
			x: 280,
			y: 557
		},
		icons: [{
			id: "Draw",
			title: "Write & Draw",
			icons: [{
				id: "Scribble",
				title: "Just like using a pencil"
			}, {
				id: "ScribbleFill",
				title: "Fill in your scribble"
			}, {
				id: "Line",
				title: "Draw a line"
			}, {
				id: "Arrow",
				title: "Draw an arrow"
			}, {
				id: "Text",
				title: "Add some text"
			}/*, {
				id: "TextBox",
				title: "Add some text within a box"
			}*/]
		}, {
			id: "Shapes",
			title: "Select a Shape",
			icons: [{
				id: "Rectangle",
				title: "Draw a rectangle"
			}, {
				id: "Circle",
				title: "Draw a circle (about the radius)"
			}, {
				id: "RectangleFill",
				title: "Draw a filled in rectangle"
			}, {
				id: "CircleFill",
				title: "Draw a filled in circle (about the radius)"
			}]
		}, {
			id: "Settings",
			title: "Line Width",
			icons: [{
				id: "1px",
				title: "Set the line width to 1 pixel"
			}, {
				id: "2px",
				title: "Set the line width to 2 pixels"
			}, {
				id: "4px",
				title: "Set the line width to 4 pixels"
			}, {
				id: "8px",
				title: "Set the line width to 8 pixels"
			}]
		}, 
			eraseJSON,
		{
			id: "Move",
			title: "Move",
			transformY: 2
		}, {
			id: "Scale",
			title: "Scale",
			transformX: 7,
			transformY: 7
		}, {
			id: "Rotate",
			title: "Rotate",
			transformX: 5,
			transformY: 7
		}, {
			id: "Undo",
			title: "Undo"
		}, {
			id: "Redo",
			title: "Redo"
		}]
	}
	
	var icons = this.json.board.paper.set();
	var paths = null;
	var cmd = null;
	var offset = 0;
	for (var ndx = 0, ni = buttonsJSON.icons.length; ndx < ni; ndx++) {
		cmd = "paths = getWhiteboard" + buttonsJSON.icons[ndx].id + "Paths()";
		eval(cmd);	//	need to find a better way to do this

		var transformX = buttonsJSON.icons[ndx].transformX || 0,
			transformY = buttonsJSON.icons[ndx].transformY || 0;

		var iconBackground = this.json.board.paper.path(paths[0]).attr({'fill':'#ffffff','stroke':'none','stroke-width':'0','fill-opacity':'1','stroke-opacity':'0'}).transform("t" + (buttonsJSON.position.x + offset + transformX) + "," + (buttonsJSON.position.y + transformY));
		var iconForground = this.json.board.paper.path(paths[1]).attr({'fill':'#9f928b','stroke':'none','stroke-width':'0','fill-opacity':'1','stroke-opacity':'0'}).transform("t" + (buttonsJSON.position.x + offset + transformX) + "," + (buttonsJSON.position.y + transformY));
		var iconArea = this.json.board.paper.path('M 0 0 L 40 0 L 40 40 L 0 40 Z').attr({'title': buttonsJSON.icons[ndx].title,'fill':'white','stroke':'none','stroke-width':'0','fill-opacity':'0','stroke-opacity':'0'}).transform("t" + (buttonsJSON.position.x + offset) + "," + buttonsJSON.position.y);
		offset = (offset + 50);

		this.icons[buttonsJSON.icons[ndx].id] = iconForground;

		var icon = this.json.board.paper.set();
		icon.push(iconBackground, iconForground, iconArea);
		
		//	OK, now lets add the events for these icons, hover & click
		//	what happens if we hover over the button?
		icon.data("this", this);
		icon.data("icon", icon);
		icon.data("icons", buttonsJSON.icons[ndx].icons);
		icon.data("id",  buttonsJSON.icons[ndx].id);

		if (window.role != "observer") {
			icon.click(function() {
				if (window.whiteboardSetup === "corkboard") return;
				
				var me = this.data("this");
				var id = this.data("id");
				var icons = this.data("icons");

				//	firstly, lets reset the cursor
				me.paint.resetCursor();
				me.paint.setAttrPencilShape("default");


				//	lets reset all the menu colours first (those that can change that is)...
				me.icons.Draw.attr({fill: '#9f928b'});
				me.icons.Shapes.attr({fill: '#9f928b'});
				me.icons.Settings.attr({fill: '#9f928b'});
				if (window.role === 'participant') {
					me.icons.EraseOne.attr({fill: '#9f928b'});
				} else {
					me.icons.Erase.attr({fill: '#9f928b'});
				}
				me.icons.Move.attr({fill: '#9f928b'});
				me.icons.Scale.attr({fill: '#9f928b'});
				me.icons.Rotate.attr({fill: '#9f928b'});

				console.log(WHITEBOARD_ICON_BACKGROUND_COLOUR);

				switch(id) {
					case "Draw":{
						me.icons.Draw.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
						me.paint.drawPoplist(icons, id);
					}
					break;
					case "Shapes":{
						me.icons.Shapes.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
						me.paint.drawPoplist(icons, id);
					}
					break;
					case "Settings":{
						me.icons.Settings.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
						me.paint.drawPoplist(icons, id);
					}
					break;
					case "Erase":{
						me.icons.Erase.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
						me.paint.drawPoplist(icons, id);
					}
					break;
					case "EraseOne":{
						if (window.whiteboardMode === WHITEBOARD_MODE_DELETE) {
							hideFreeTransformToObjects(me.paint.getPaper());
						} else {
							me.icons.EraseOne.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
							me.paint.clearPoplist();
							me.paint.setEraser();
						}
					}
					break;
					case "Move": {
						//	TODO:	highlight the Move icon
						me.icons.Move.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
						me.paint.clearPoplist();
						me.paint.setMove("move");
					}
					break;
					case "Scale": {
						//	TODO:	highlight the Move icon
						me.icons.Scale.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
						me.paint.clearPoplist();
						me.paint.setMove("scale");
					}
					break;
					case "Rotate": {
						//	TODO:	highlight the Move icon
						me.icons.Rotate.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
						me.paint.clearPoplist();
						me.paint.setMove("rotate");
					}
					break;
					case "Undo": {
						me.paint.clearPoplist();
						hideFreeTransformToObjects(me.paint.getPaper());
						if (window.um.getStatus().isUndo) {
							var object = um.undo();
							me.undo(object);
						}
					}
					break;
					case "Redo": {
						me.paint.clearPoplist();
						hideFreeTransformToObjects(me.paint.getPaper());
						if (window.um.getStatus().isRedo) {
							var object = um.redo();
							me.redo(object);
						}
					}
					break;
				}
			});
		}

		if (window.role != "observer") {
			switch (buttonsJSON.icons[ndx].id) {
				default: {
					icon.hover(
						//	hover in
						function() {
							var icon = this.data("icon");
							if (icon[1].animate) {
								var animationHoverIn = Raphael.animation({'stroke':'none','stroke-width':'0','fill-opacity':'0.5','stroke-opacity':'0'}, 250);
								if (!icon[1].removed) icon[1].animate(animationHoverIn.delay(0));
							}
						},
						//	hover out
						function() {
							var icon = this.data("icon");
							if (icon[1].animate) {
								var animationHoverOut = Raphael.animation({'stroke':'none','stroke-width':'0','fill-opacity':'1','stroke-opacity':'0'}, 250);
								if (!icon[1].removed) icon[1].animate(animationHoverOut.delay(0));
							}
						}
					);
				}
				break;
			}
		}
		
		//	lets add this to our whiteboard now
		icons.push(icon);
	}
	
	return icons;
}

//-----------------------------------------------------------------------------
//	get the target area for the whiteboard
view.Whiteboard.prototype.getTargetAsJSON = function() {
	return this.target;
};

view.Whiteboard.prototype.setResource = function(json, clearWhiteboard) {
	if (isEmpty(json)) return;
	if (isEmpty(json.type)) return;

	if (isEmpty(clearWhiteboard)) clearWhiteboard = false;

	switch(json.type) {
		case 'image': {
			if (!isEmpty(this.paint)) this.paint.setImage(json, clearWhiteboard);
		}
		break;
	}
};

//-----------------------------------------------------------------------------
view.Whiteboard.prototype.undo = function(object) {
	var doSave = false;

	switch(object.action) {
		case 'move': {
			doSave = updatePathForObject(object.object, (object.translate.x * -1), (object.translate.y * -1));

			object.object.attrs.translate.x = object.object.attrs.translate.x - object.translate.x;
			object.object.attrs.translate.y = object.object.attrs.translate.y - object.translate.y;
			object.object.apply();
		}
		break;
		case 'scale': {
			object.object.subject.message.scale = {
				x: object.object.subject.message.scale.x - object.scale.x,
				y: object.object.subject.message.scale.y - object.scale.y
			};

			object.object.attrs.scale = {
				x: object.object.attrs.scale.x - object.scale.x,
				y: object.object.attrs.scale.y - object.scale.y
			};

			object.object.apply();

			doSave = true;
		}
		break;
		case 'rotate': {
			object.object.subject.message.rotate = object.object.subject.message.rotate + object.rotate;

			object.object.attrs.rotate = object.object.attrs.rotate + object.rotate;
			object.object.apply();

			doSave = true;
		}
		break;
		case 'create': {
			socket.emit('deleteobject', object.object.freeTransform.subject.message.id);

			object.object.freeTransform.hideHandles();
			object.object.freeTransform.subject.hide();		//	we can unhide this object if this action is "undo"ne
		}
		break;
		case 'delete': {
			socket.emit('restoreobject', object.object.subject.message.id, object.object.subject.message);
		}
		break;
	}

	if (doSave) {
		var messageJSON = {
			type: 'sendobject',
			message: object.object.subject.message,
			all: false
		}

		window.sendMessage(messageJSON);
	}	
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Whiteboard.prototype.redo = function(object) {
	var doSave = false;

	switch(object.action) {
		case 'move': {
			doSave = updatePathForObject(object.object, object.translate.x, object.translate.y);
			object.object.attrs.translate.x = object.object.attrs.translate.x + object.translate.x;
			object.object.attrs.translate.y = object.object.attrs.translate.y + object.translate.y;
			object.object.apply();
		}
		break;
		case 'scale': {
			object.object.subject.message.scale = {
				x: object.object.subject.message.scale.x + object.scale.x,
				y: object.object.subject.message.scale.y + object.scale.y
			};

			object.object.attrs.scale = {
				x: object.object.attrs.scale.x + object.scale.x,
				y: object.object.attrs.scale.y + object.scale.y
			};

			object.object.apply();

			doSave = true;
		}
		break;
		case 'rotate': {
			object.object.subject.message.rotate = object.object.subject.message.rotate - object.rotate;

			object.object.attrs.rotate = object.object.attrs.rotate - object.rotate;
			object.object.apply();

			doSave = true;
		}
		break;
		case 'create': {
			socket.emit('restoreobject', object.object.freeTransform.subject.message.id, object.object.freeTransform.subject.message);
		}
		break;
		case 'delete': {
			socket.emit('deleteobject', object.object.subject.message.id);

			object.object.hideHandles();
			object.object.subject.hide();		//	we can unhide this object if this action is "undo"ne
		}
		break;
	}

	if (doSave) {
		var messageJSON = {
			type: 'sendobject',
			message: object.object.subject.message,
			all: false
		}

		window.sendMessage(messageJSON);
	}	
};


