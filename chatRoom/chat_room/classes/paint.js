var view = namespace('sf.ifs.View');

/*
	json: {
		scale: (316 / 950),		//	default to small scale
		paper: pointer			//	pointer to the canvas we are drawing on
	}
*/

view.Paint = function(json) {
	//initialization
	this.json = json;
	this.json.scale = 1;
	
	this.personalImages = new Array();
	
	this.whiteboardImage = null;
	this.whiteboardImageClose = null;

	var canvasWidth = 950,
		canvasHeight = 460;

	var corkboardWidth = 950,
		corkboardHeight = 460;

	this.Height = canvasHeight;

	if (this.paint != null) {
		if (this.paint[0] != null) this.paint.remove();
	}

	//	if the role of the participant is "observer" then we need to make sure they can't paint anything
	this.userName = this.json.thisMain.username;
	var participant = this.json.thisMain.getParticipantByName(this.userName);

	if (participant.role === "observer") { //	set up a canvas of no width of height
		canvasWidth = 0;
		canvasHeight = 0;
	}

	//	we draw in this canvas.  if we send it to the back, then we can manipulate the objects underneath...
	//	we attach the onStart, onMove and onUp events to this object...
	this.paint = this.json.paper.rect(0, 0, canvasWidth, canvasHeight).attr({
		fill: "white",
		"opacity": 0,
		cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_pencil.png)",
		stroke: "white"
	});

	//	set up our corkboard for later...
	this.corkboard = this.json.paper.image(window.URL_PATH + window.CHAT_ROOM_PATH + "resources/images/corkboard960x460.jpg", 0, 0, corkboardWidth, corkboardHeight).transform("s" + this.json.scale + "," + this.json.scale + ", 0, 0").attr({opacity: 0}).transform("s" + this.json.scale + "," + this.json.scale + ", 0, 0");
	this.corkboard.data("dont_remove", true);
	this.corkboard.toBack();

	this.paint.data("dont_remove", true);
	this.paint.transform("s" + this.json.scale + "," + this.json.scale + ", 0, 0");

	//	array to handle editable objects

	this.objects = new sf.ifs.View.Objects({
		scale: this.json.scale,
		thisMain: this.json.thisMain,
		paint: this.paint,
		paper: this.json.paper
	});

	var poplistScale = canvasWidth < canvasHeight ? canvasWidth : canvasHeight;
	poplistScale = (poplistScale / 10);

	this.poplist = new sf.ifs.View.Poplist({
		expsize: this.json.expsize,
		poplistScale: poplistScale,
		objects: this.objects,
		thisMain: this.json.thisMain,
		paper: this.json.paper
	});

	this.poplist.setParents(this.paint);

	this.paint.attribute = new Array();
	this.paint.attribute["pencilShape"] = "default";
	this.paint.attribute["stroke-width"] = 4;			//	default to 4px
	this.paint.attribute["fill"] = "#ffffff";
	this.paint.attribute["text"] = "";
	this.paint.attribute["font"] = "";
	if (participant === null) this.paint.attribute["stroke"] = "#000000";
	else {
		if (participant.role === "observer") this.paint.attribute["stroke"] = "#000000";
		else {
			this.paint.attribute["stroke"] = colourToHex(participant.colour);
			this.paint.attribute["fill"] = colourToHex(participant.colour);
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	set up our events
	this.paintSet = this.json.paper.set();
	this.paint.child = this.paintSet;
	this.paintSet.parent = this.paint;
	this.paint.expanded = true;
	this.path = "";


	this.paint.data("this", this);
	//this.paint.drag(onMove, onStart, onEnd);
	this.paint.threshold = 10;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.paint.mousedown(onMouseDown);
	this.paint.mousemove(onMouseMove);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	lastly, lets set up our undoManager
	this.undoManager = new sf.ifs.View.UndoManager();

	//this.paint.undrag();
};	//	end of the constructor


//----------------------------------------------------------------------------
view.Paint.prototype.setJSON = function (json) {
	this.json = json;
};

//----------------------------------------------------------------------------
view.Paint.prototype.getPaper = function () {
	if (!isEmpty(this.paint)) {
		if (!isEmpty(this.paint.paper)) {
			return this.paint.paper;
		}
	}

	return null;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.paintScale = function(scale) {
	scale = 1;
	this.json.scale = scale;
	this.objects.json.scale = scale;

	if (this.paint.animate) {
		if (!this.paint.removed) this.paint.animate({
			opacity: 0
		}, 500, "<>", function () {
			this.paper.forEach(function (el) {
				var strokeWidth = el.data("strokeWidth");
				if (typeof el.message != "undefined") {
					if (typeof strokeWidth != "undefined") {
						el.transform("s" + scale + "," + scale + ", 0, 0" + " t" + el.message.transX + " " + el.message.transY).attr({
							"stroke-width": strokeWidth * scale
						});
					} else {
						el.transform("s" + scale + "," + scale + ", 0, 0" + " t" + el.message.transX + " " + el.message.transY);
					}
					try {
						el.box.transform("s" + scale + "," + scale + ", 0, 0" + " t" + el.message.transX + " " + el.message.transY).attr({
							"stroke-width": strokeWidth * scale
						});
					} catch (e) {}
				} else {
					if (typeof el.associatedText == "undefined") {
						if (typeof strokeWidth != "undefined") {
							el.transform("s" + scale + "," + scale + ", 0, 0").attr({
								"stroke-width": strokeWidth * scale
							});
						} else {
							el.transform("s" + scale + "," + scale + ", 0, 0");
						}
					}
				}
			});
		})
	}

	if (scale === 1) {
		this.setCursor(this.paint.attribute["pencilShape"]);
		this.paint.expanded = true;
	} else {
		this.paint.attr({
			cursor: "default"
		});
		this.paint.expanded = false;
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.setParents = function (whiteboard) {
	this.paint.parent = whiteboard;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.getAttrPencilShape = function() {
	return this.paint.attribute["pencilShape"];
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.setAttrPencilShape = function (newShape) {
	this.paint.attribute["pencilShape"] = newShape;
	this.setCursor(newShape);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.resetCursor = function() {
	this.paint.paper.forEach(function (el) {
		el.attr({
			cursor: "default"
		});
	});
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.setCursor = function(newShape) {
	this.resetCursor();
	this.paint.attr({cursor: "default"});//For the browser(Firefox) who cannot load customised cursor, preset to default cursor

	switch (newShape) {
	case "scribble":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_pencil.png)"
		});
		break;
	case "scribble-fill":
		this.paint.attr({
		cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_scribble_fill.png)"
	});
	break;
	case "line":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_line.png)"
		});
		break;
	case "arrow":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_arrow.png)"
		});
		break;
	case "circle":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_circle.png)"
		});
		break;
	case "circle-fill":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_circle_fill.png)"
		});
		break;
	case "rectangle":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_rect.png)"
		});
		break;
	case "rectangle-fill":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_rect_fill.png)"
		});
		break;
	case "text-box":
	case "text":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_text.png)"
		});
		break;
	case "polygon":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_poly.png)"
		});
		break;
	case "polygon-fill":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_poly_fill.png)"
		});
		break;
	case "eraser":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_eraser.png)"
		});
		break;
	case "move":
		this.paint.attr({
			cursor: "move"
		});
		break;
	case "scale":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_scale.png)"
		});
		break;
	case "rotate":
		this.paint.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_rotate.png)"
		});
		break;
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.setAttrStrokeWidth = function (newWidth) {
	this.paint.attribute["stroke-width"] = newWidth;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.setAttrFillColour = function (newColour) {
	this.paint.attribute["fill"] = newColour;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.setAttrStrokeColour = function (newColour) {
	this.paint.attribute["stroke"] = newColour;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.setAttrText = function (newText) {
	this.paint.attribute["text"] = newText;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.drawPoplist = function (choices, types) {
	//	call the following from paintUtilities
	hideFreeTransformToObjects(this.paint.paper);

	this.paint.toFront();
	this.paint.drag(onMove, onStart, onEnd);

	if (!isEmpty(this.whiteboardImageClose)) {
		this.whiteboardImageClose.getIcon().toFront();
	}
	try {
		this.poplist.cw.remove();
	} catch (e) {}

	this.poplist.draw(choices, types);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.clearPoplist = function () {
	if (!isEmpty(this.poplist)) {
		try {
			this.poplist.clearPoplist();
		} catch (e) {}
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.updateCanvas = function (name, data, removeDragEvents) {
	if (isEmpty(data)) return;
	if (isEmpty(data.rotate)) data.rotate = 0;
	if (isEmpty(data.scale)) data.scale = {
		x: 1,
		y: 1
	};

	//	set up any defaults
	if (isEmpty(removeDragEvents)) removeDragEvents = false;

	//	lets remove transX & transY before saving...
	if (!isEmpty(data.transX)) {
		delete data.transX;
	}

	if (!isEmpty(data.transY)) {
		delete data.transY;
	}
	//	does this object already exist
	var object = findObjectByID(this.paint.paper, data.id);

	if (!isEmpty(object)) {
		if (!isEmpty(object.freeTransform)) {
			if (!isEmpty(object.freeTransform.subject)) {
				object.freeTransform.subject.show();
			}
		}

		//	it seems we just need to update this object :-)
		//	firstly, lets work out what the transform variables are...
		var tx = 0,
			ty = 0;

		var ox = 0,
			oy = 0;

		var dx = 0,
			dy = 0;

		if (!isEmpty(object.message.type)) {
			switch(object.message.type) {
				case 'circle':
				case 'circle-fill':
				case 'text':
				case 'text-box': {
					ox = object.message.para[0];
					oy = object.message.para[1];
					dx = data.para[0];
					dy = data.para[1];
					tx = (dx - ox);
					ty = (dy - oy);
				}
				break;
				default: {
					if (object.attrs.path.length > 0) {
						ox = object.attrs.path[0][1];
						oy = object.attrs.path[0][2];
					}

					if (!isEmpty(data.path)) {
						var dataPathArray = data.path.split(/M|L|,/);

						if (dataPathArray.length > 2) {
							dx = (dataPathArray[1] * 1);	//	converts the string into a number
							dy = (dataPathArray[2] * 1);
						}

						if (!((ox === 0) && (oy === 0))) {
							tx = dx - ox;
							ty = dy - oy;
						}
					}
				}
				break;
			}

			//	make sure we have something to translate
			if (!((tx === 0) && (ty === 0))) {
				//	we need to reset these...
				object.message.transX = tx;
				object.message.transY = ty;
				// object.message.transX = object.attrs.translate.x;
				// object.message.transY = object.attrs.translate.y;

				//	we don't look at the return value here...
				updatePathForObject(object, tx, ty);

				//	if this is a free transform object, then lets update the handles
				if (!isEmpty(object.freeTransform)) {
					object.freeTransform.attrs.translate.x = (object.freeTransform.attrs.translate.x + tx);
					object.freeTransform.attrs.translate.y = (object.freeTransform.attrs.translate.y + ty);
					object.freeTransform.apply();
				} else {
					object.transform('t' + tx + "," + ty);
				}
			}

			//	lets scale and rotate if needed
			if (!isEmpty(object.freeTransform)) {
				object.freeTransform.attrs.rotate = data.rotate;
				object.freeTransform.attrs.scale = data.scale;
				object.freeTransform.apply();
			}
		}

		object.message = data;
	} else {
		switch (data.action) {
			case "draw":
				this.drawObject(name, data);
			break;
			case "delete":
				this.paint.paper.forEach(function (el) {
					var canIDeleteThis = (typeof el.message != "undefined" && el.message.id == data.id);

					/*
					switch(thisMain.role) {
						case 'owner':
						case 'facilitator': {
							canIDeleteThis = (typeof el.message != "undefined");
						}
						break;
						default: {
							canIDeleteThis = (typeof el.message != "undefined" && el.message.id == data.id);
						}
						break;
					}
					*/
					
					if (canIDeleteThis) {
						try {
							el.box.remove();
						} catch (e) {}
						el.remove();
					}
				});
			break;
			case "deleteAll":
				//this.clearUserDrawing(data.name);
				this.clearDrawing();
			break;

			//	default is just added for backwards compatibility
			default: {
				this.drawObject(name, data);
			}
			break;
		}
	}



	//	if we are in "eraser" or "move" mode, then do nothing
	//	otherwise, lets put the paint layer back so we can draw on the whiteboard
	if (
		this.paint.attribute["pencilShape"] != "eraser" && 
		this.paint.attribute["pencilShape"] != "move" &&
		this.paint.attribute["pencilShape"] != "scale" &&
		this.paint.attribute["pencilShape"] != "rotate"
	) {
		if (!removeDragEvents) {
			this.paint.toFront();
			this.paint.drag(onMove, onStart, onEnd);
		}
		
		if (!isEmpty(this.whiteboardImageClose)) {
			this.whiteboardImageClose.getIcon().toFront();
		}
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	this comes from updateCanvas
//	updateCanvas is called from topic.updateCanvas / topic.updateCanvasFromString
//	app.js (object is broadcast having been drawn somewhere else)
view.Paint.prototype.drawObject = function (name, data, useUndo) {
	var element = null;
	if (isEmpty(data)) return;

	if (isEmpty(useUndo)) useUndo = false;
	if (isEmpty(data.rotate)) data.rotate = 0;
	if (isEmpty(data.scale)) data.scale = {
		x: 1,
		y: 1
	};

	var scale = "s1, 1";
	//var scale = "s" + data.scale.x + ", " + data.scale.y + ", 0, 0";
	//R" + data.rotate;
	//var strokeWidth = data.strokeWidth * this.json.scale;
	switch (data.type) {
		case "scribble":
		case "scribble-fill":
		case "polygon":
		case "polygon-fill":
			//data.attr["stroke-width"] = strokeWidth;
			if (!isEmpty(data.path)) {
				if (data.path.toLowerCase() != "z") {
					element = this.paint.paper.path(data.path).attr(data.attr).transform(scale).data("strokeWidth", data.strokeWidth);				
				}
			}
		break;
		case "line":
		case "arrow":
			// var path = "M" + data.para[0] + " " + data.para[1] + ",L" + data.para[2] + " " + data.para[3];
			// //data.attr["stroke-width"] = strokeWidth;
			// element = this.paint.paper.path(path).attr(data.attr).transform(scale).data("strokeWidth", data.strokeWidth);
			if (!isEmpty(data.path)) {
				element = this.paint.paper.path(data.path).attr(data.attr).transform(scale).data("strokeWidth", data.strokeWidth);
			}
		break;
		case "circle":
		case "circle-fill":
			//data.attr["stroke-width"] = strokeWidth;
			element = this.paint.paper.path(getCircleToPath(data.para[0], data.para[1], data.para[2])).attr(data.attr).transform(scale).data("strokeWidth", data.strokeWidth);
		break;
		case "rectangle":
		case "rectangle-fill":
			//data.attr["stroke-width"] = strokeWidth;
			//element = this.paint.paper.path(getRectToPath(data.para[0], data.para[1], data.para[2], data.para[3])).attr(data.attr).transform(scale).data("strokeWidth", data.strokeWidth);
			//element = this.paint.paper.path(data.path).attr(data.attr).transform(scale).data("strokeWidth", data.strokeWidth);
			if (!isEmpty(data.path)) {
				element = this.paint.paper.path(data.path).attr(data.attr).transform(scale).data("strokeWidth", data.strokeWidth);
			}
		break;
		case "text":
			//data.attr["stroke-width"] = strokeWidth;
			element = this.paint.paper.text(data.para[0], data.para[1], data.para[2]).attr(data.attr).attr({'text-anchor': 'start'}).transform(scale).data("strokeWidth", data.strokeWidth);
		break;
		case "text-box":
			//data.attr["stroke-width"] = strokeWidth;
			var attr = {stroke: data.attr.fill, 'stroke-width': data.attr['stroke-width']};
			var text = this.paint.paper.text(data.para[0], data.para[1], data.para[2]).attr(data.attr).attr({'text-anchor': 'start'}).data("strokeWidth", data.attr['stroke-width']);
			var bbox = text.getBBox();
			var box = this.paint.paper.rect(bbox.x, bbox.y, bbox.width, bbox.height).attr(attr);
			element = this.paint.paper.set(
				text,
				box
			).transform(scale);
			text.parent = element;
		break;
	}

	//	lets do some post processing on the element...
	if (element != null) {
		element.message = data;

		//	lets attach a free transfrom to our created object
		attachFreeTransformToObject('always', this.paint.paper, element, data.scale, data.rotate);

		//	lets push the newly created object onto our undo manager
		if (useUndo) {
			um.push({
				action: 'create',
				uid: element.freeTransform.subject.message.id,
				object: element
			});
		}
		
		//	what does this code do?  Oh, OK, this just orders the objects as they come in...
		var tempEl = null;
		var tsBefore = 0;
		this.paint.paper.forEach(function (el) {
			if (!isEmpty(el.message)) {
				if ((el.message.id > tsBefore) && (el.message.id < data.id)) {
					tsBefore = el.message.id;
					tempEl = el;
				}
			}
		});

		if (!isEmpty(tempEl)) {
			element.insertAfter(tempEl);
			try{
				element.box.insertAfter(tempEl);
			} catch(e) {}
		}
	}
	
	//	lets make sure any image on this whiteboard is at the back
	this.paint.paper.forEach(function (el) {
		if (!isEmpty(el.data)) {
			if (typeof el.data("send_to_back") != "undefined") {
				if (el.data("send_to_back") === true) {
					el.toBack();
				}
			}
		}
	});
	
	element = null;
	tempEl = null;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.updateEvent = function (topicid, data) {
	this.objects.updateEvent(topicid, data);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.setImage = function (json, clearWhiteboard) {
	//	lets check our parameters
	if (isEmpty(json)) return;

	//	this defaults to true
	if (isEmpty(clearWhiteboard)) clearWhiteboard = true;

	var canvasWidth = 951,
		canvasHeight = 460;
		
	var whiteboardImageWidth = (canvasWidth * 0.75),
		whiteboardImageHeight = (canvasHeight * 0.75);

	var dimensions = {
		width: whiteboardImageWidth,
		height: whiteboardImageHeight
	};
	
	if (typeof json.actualSize != "undefined") {
		dimensions = getFittedDimensions(json.actualSize.width, json.actualSize.height, whiteboardImageWidth, whiteboardImageHeight);
	}

	//	lets remove just the drawings from the whiteboard
	if (clearWhiteboard) {
		removeFreeTransformObjects(this.paint.paper);
	}

	if ((json.content === "none") || (json.content === "delete")) {
	} else {
		if (!isEmpty(this.whiteboardImage)) {
			if (!isEmpty(this.whiteboardImage[0])) this.whiteboardImage.remove();
		}

		if (!isEmpty(this.whiteboardImageClose)) {
			this.whiteboardImageClose.getIcon.remove();
		}

		var x = ((canvasWidth - dimensions.width) / 2),
			y = 10;

		this.whiteboardImage = this.json.paper.image(json.content, x, y, dimensions.width, dimensions.height).transform("s1, 1, 0, 0");
		this.whiteboardImage.toBack();
		this.whiteboardImage.data("send_to_back", true);
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.setMove = function (type) {
	if (isEmpty(type)) return;

	//	toggle our handles on and off
	var lastWhiteboardMode = window.whiteboardMode;
	hideFreeTransformToObjects(this.paint.paper);

	switch(type) {
		case 'move': {	
			if (lastWhiteboardMode != WHITEBOARD_MODE_MOVE) {
				this.setAttrPencilShape(type);

				if (!isEmpty(window.role)) {
					showFreeTransformToObjects(window.role, this.paint.paper, WHITEBOARD_MODE_MOVE);
				}

				this.paint.paper.forEach(function (el) {
					el.attr({
						cursor: "move"
					});
				});

				this.paint.toBack();
				this.paint.undrag();
			}
		}
		break;
		case 'scale': {
			if (lastWhiteboardMode != WHITEBOARD_MODE_SCALE) {
				this.setAttrPencilShape(type);

				if (!isEmpty(window.role)) {
					showFreeTransformToObjects(window.role, this.paint.paper, WHITEBOARD_MODE_SCALE);
				}

				this.paint.toBack();
				this.paint.undrag();
			}
		}
		break;
		case 'rotate': {
			if (lastWhiteboardMode != WHITEBOARD_MODE_ROTATE) {
				this.setAttrPencilShape(type);

				if (!isEmpty(window.role)) {
					showFreeTransformToObjects(window.role, this.paint.paper, WHITEBOARD_MODE_ROTATE);
				}

				this.paint.toBack();
				this.paint.undrag();
			}
		}
		break;
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.setEraser = function () {
	this.setAttrPencilShape("eraser");

	if (!isEmpty(window.role)) {
		showFreeTransformToObjects(window.role, this.paint.paper, WHITEBOARD_MODE_DELETE);
	}

	this.paint.paper.forEach(function (el) {
		el.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_eraser.png)"
		});
	});

	this.paint.toBack();
	this.paint.undrag();
};

// view.Paint.prototype.setEraser = function () {
// 	this.setAttrPencilShape("eraser");

// 	this.paint.paper.forEach(function (el) {
// 		el.attr({
// 			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_eraser.png)"
// 		});
// 	});

// 	this.paint.toBack();
// };

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.setEraseAll = function () {
	//	clear our whiteboard
	var objects = this.clearDrawing();

	var message = {
		name: this.userName,
		action: "deleteAll",
		objects: objects
	};
	var messageJSON = {
		type: 'sendobject',
		message: message
	};
	window.sendMessage(messageJSON);
};

/*
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.updateUndo = function (eventid, username, topicid, data) {
	if (isEmpty(data)) return;

	switch (data.action) {
	case "draw":
		data.action = "delete";
		this.updateCanvas(username, data);
		break;
	case "move":
		data.transX = data.fromX;
		data.transY = data.fromY;
		this.updateCanvas(username, data);
		break;
	case "delete":
		data.action = "draw";
		this.updateCanvas(username, data);
		break;
	case "deleteAll":
	if (!isEmpty(data.objects)) {
			for (var ndx = 0, ll = data.objects.length; ndx < ll; ndx++) {
				//	data.objects[ndx].action="draw";
				this.updateCanvas(username, data.objects[ndx]);
			}
		}
		break;
	}

	//leave topic id here for further work
	if (username == this.json.thisMain.username) {
		this.objects.redoStack.push(eventid);
		
		//window.whiteboard.redo.update();
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.updateRedo = function (eventid, username, topicid, data) {
	this.updateCanvas(username, data);

	if (username == this.json.thisMain.username) {
		this.objects.undoStack.push(eventid);
		
		//window.whiteboard.undo.update();
	}
};

*/

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	this funciton clears a drawing based on the users name
view.Paint.prototype.clearUserDrawing = function (name) {
var objects = new Array();
	var localStack = new Array();

	this.paint.paper.forEach(function (el) {
		if (typeof el.message != "undefined" && el.message.name == name) {
			localStack.push(el);
			objects.push(el.message);
		} else {
			if (typeof el.data != "undefined") {
				if (typeof el.data("send_to_back") != "undefined") {
					if (el.data("send_to_back") === true) {
						el.remove();
						var json = {
							target: "whiteboard",
							type: "image",
							content: "none"
						};
				
						thisMain.setResource(json);
						thisMain.imageMenuResourceOnUp(json, false);
					}
				}
			}
		}
	});
	
	for (var ndx = 0, ll = localStack.length; ndx < ll; ndx++) {
		try {
			localStack[ndx].box.remove();
		} catch (e) {}
		localStack[ndx].remove();
	}

	objects = this.sortArrayById(objects);
	return objects;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.clearDrawing = function () {
	var objects = new Array();
	var localStack = new Array();

	this.paint.paper.forEach(function (el) {
		if (!isEmpty(el.parent)) el = el.parent;
		if (typeof el.message != "undefined") {
			localStack.push(el);
			objects.push(el.message);
		} else {
			if (typeof el.data != "undefined") {
				if (typeof el.data("send_to_back") != "undefined") {
					if (el.data("send_to_back") === true) {
						el.remove();
						var json = {
							target: "whiteboard",
							type: "image",
							content: "none"
						};
				
						thisMain.setResource(json);
						thisMain.imageMenuResourceOnUp(json, false);
					}
				}
			}
		}
	});
	
	for (var ndx = 0, ll = localStack.length; ndx < ll; ndx++) {
		try {
			localStack[ndx].box.remove();
		} catch (e) {}
		localStack[ndx].remove();
	}

	objects = this.sortArrayById(objects);
	return objects;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.sortArrayById = function (objects) {
	//	if objects hasn't been defined, at least return the correct object
	if (isEmpty(objects)) return new Array();
	
	var temp;
	for (var ll = objects.length, i = (ll - 1); i > 0; i--) {
		for (var j = 0; j < i; j++) {
			if (objects[j].id > objects[j + 1].id) {
				temp = objects[j];
				objects[j] = objects[j + 1];
				objects[j + 1] = temp;
			}
		}
	}

	return objects;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.getScale = function() {
	return this.json.scale;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.corkboardToFront = function() {
	if (!isEmpty(this.corkboard)) {
		this.corkboard.attr({opacity: 1.0});
		this.corkboard.toFront();

		window.whiteboardSetup = "corkboard";

		for (var ndx = 0; ndx < 8; ndx++) {
			if (!isEmpty(this.personalImages[ndx])) {
				this.personalImages[ndx].toFront();
			} 
		}
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
view.Paint.prototype.corkboardToBack = function() {
	if (!isEmpty(this.corkboard)) {
		this.corkboard.attr({opacity: 0});
		this.corkboard.toBack();

		window.whiteboardSetup = "drawing";
		
		for (var ndx = 0; ndx < 8; ndx++) {
			if (!isEmpty(this.personalImages[ndx])) {
				if (!isEmpty(this.personalImages[ndx][0])) {
					if (!this.personalImages[ndx][0].removed) {
						this.personalImages[ndx].remove();
						this.personalImages[ndx] = null;
					}
				}
			} 
		}

		this.personalImages = new Array();
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/*
	participantsDetails = {
		number: int,			//	0..7 (participants only)
		name: string,			//	file name as stored in the ../uploads folder
		colour: int				//	avatars colour
	}
*/
view.Paint.prototype.updateCorkboard = function(x, y, width, height, personalImage, participantsDetailsJSON) {
	//	lets add a margin around the image
	var margin = 5;

	x = x + margin,
	y = y + margin,
	width = width - (2 * margin),
	height = height - (2 * margin);
	
	if (!isEmpty(this.personalImages[participantsDetailsJSON.number])) {
		this.personalImages[participantsDetailsJSON.number].remove();
		this.personalImages[participantsDetailsJSON.number] = null;
	}
	
	var event = decodeURI(personalImage.event);
		
	var json = JSON.parse(event);
		
	var path = window.URL_PATH + window.CHAT_ROOM_PATH + "uploads/" + json.name;
		
	var fittedDimensions = getFittedDimensions(json.width, json.height, width, height);
		
	var fittedX = x + ((width - fittedDimensions.width) / 2),
		fittedY = y + ((height - fittedDimensions.height) / 2);

	this.personalImages[participantsDetailsJSON.number] = this.json.paper.set();

	var image = this.json.paper.image(path, fittedX, fittedY, fittedDimensions.width, fittedDimensions.height).attr({opacity: 1}).transform("s1, 1, 0, 0").attr({
		title: participantsDetailsJSON.name + "'s image"
	});

	var colour = participantsDetailsJSON.colour,
		isDec = true;

	if (typeof colour === "string") {
		if (colour[0] = '#') isDec = false;
	}

	if (isDec) colour = colourToHex(participantsDetailsJSON.colour);

	var border = this.json.paper.rect(fittedX, fittedY, fittedDimensions.width, fittedDimensions.height).attr({opacity: 1}).transform("s1, 1, 0, 0").attr({
		stroke: colour,
		"stroke-width": 5.0,
		"stroke-opacity": 1.0
	});

	this.personalImages[participantsDetailsJSON.number].push(image);
	this.personalImages[participantsDetailsJSON.number].push(border);

	//	
	switch(window.role) {
		case 'owner':
		case 'facilitator': {
			var onCloseClick = function() {
				console.log(this);
				var id = this.details.id;

				window.dashboard.showMessage({
					message: {
						text: "Deleting this Image will\ndelete it permanently.\n \nAre you sure you want to delete\nthis image?",
						attr: {
							'font-size': 36,
							fill: "white"
						}
					},
					dismiss: {
						cancel: {						//	check using window.dashboard.YES
							text:	"Cancel",
							attr: {
								'font-size': 24,
								fill: "white"
							}
						},
						yes: {						//	check using window.dashboard.YES
							text:	"OK",
							attr: {
								'font-size': 24,
								fill: "white"
							}
						}
					}
				}, function(value) {
					if (value === window.dashboard.YES) {
						var dataJson = {
							id : id
						};
						window.socket.emit('deleteimage', dataJson);
					}

					window.dashboard.toBack();		//	time to hide the dashboard
				});
			};

			var iconJSON = {
				x:			fittedX  - DEFAULT_ICON_RADIUS,
				y:			fittedY - DEFAULT_ICON_RADIUS,
				click:		onCloseClick,
				path:		getClosePath(),
				details: 	participantsDetailsJSON,
				thisMain:	this.json.thisMain,
				paper:		this.json.paper
			};
			
			//	time to draw the close icon
			var close = new sf.ifs.View.Icon(iconJSON);
			var iconClose = close.draw();

			//	add this to our image set
			this.personalImages[participantsDetailsJSON.number].push(iconClose);
		}
		break;
		default:
	break;
}


};

view.Paint.prototype.deleteObject = function(uid) {
	if (isEmpty(uid)) return;

	var object = findObjectByID(this.paint.paper, uid);

	if (!isEmpty(object)) {
		//	does this object have free transform attached?
		if (!isEmpty(object.freeTransform)) {
			object.freeTransform.unplug();			//	lets remove the free translation stuff first
		}

		object.remove();

		//	now lets remove this object (keep our memory clean)
		delete object;
	}
};
