//----------------------------------------------------------------------------
var generateUID = function (separator) {
	var delim = separator || "-";

	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}

	return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
};

//----------------------------------------------------------------------------
var onStart = function (x, y, event) {
	if (this.expanded) {
		var me = this.data("this");
		
		//	lets make sure this is cleared out
		me.path = "";

		var canvas_container = document.getElementById("canvas_container");
		var canvas = document.getElementById("canvas");

		this.orgX = (x - (canvas_container.offsetLeft + canvas.offsetLeft));
		this.orgY = (y - (canvas_container.offsetTop + canvas.offsetTop));

		switch (this.attribute["pencilShape"]) {
		case "scribble":
		case "scribble-fill":
			me.path = "M" + this.orgX + "," + this.orgY;
			break;
		case "line":
		case "arrow":
		case "circle":
		case "circle-fill":
		case "rectangle":
		case "rectangle-fill":
		}
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var onMove = function (dx, dy, x, y, event) {
	var currentStrokeWidth = 4;

	if (this.expanded) { //	probably not needed as if the paper isn't expanded, it will be behind other divs anyway...
		var me = this.data("this");

		var canvas_container = document.getElementById("canvas_container");
		var canvas = document.getElementById("canvas");

		this.nowX = (x - (canvas_container.offsetLeft + canvas.offsetLeft));
		this.nowY = (y - (canvas_container.offsetTop + canvas.offsetTop));

		switch (this.attribute["pencilShape"]) {
		case "scribble":
			me.path = me.path + "L" + this.nowX + "," + this.nowY;
			if (this.currentPath != null) {
				if (this.currentPath[0] != null) {
					this.currentPath.remove();
				}
			}

			//var currentStrokeWidth = this.attribute["stroke-width"] * me.json.scale; //	be sure we scale our line width
			this.currentPath = me.paint.paper.path(me.path).attr({
				"stroke": this.attribute["stroke"],
				"stroke-width": currentStrokeWidth
			});
			//this.currentPath.transform("s" + me.json.scale + "," + me.json.scale + ",0, 0");
			
			break;
		case "scribble-fill":
			me.path = me.path + "L" + this.nowX + "," + this.nowY;
			if (this.currentPath != null) {
				if (this.currentPath[0] != null) {
					this.currentPath.remove();
				}
			}

			if (this.closurePath != null) {
				if (this.closurePath[0] != null) {
					this.closurePath.remove();
				}
			}

			//var currentStrokeWidth = this.attribute["stroke-width"] * me.json.scale; //	be sure we scale our line width
			this.currentPath = me.paint.paper.path(me.path).attr({
				"stroke": this.attribute["stroke"],
				"stroke-width": currentStrokeWidth
			});

			this.closurePath = me.paint.paper.path("M" + this.orgX + "," + this.orgY + " L" + this.nowX + "," + this.nowY).attr({
				"stroke": this.attribute["stroke"],
				"stroke-dasharray": "--",
				"stroke-width": currentStrokeWidth
			});

			//this.currentPath.transform("s" + me.json.scale + "," + me.json.scale + ",0, 0");
			//this.closurePath.transform("s" + me.json.scale + "," + me.json.scale + ",0, 0");
			
			break;
		case "line":
			me.path = "M" + this.orgX + "," + this.orgY + ",L" + this.nowX + " " + this.nowY;
			if (this.currentPath != null) {
				if (this.currentPath[0] != null) {
					this.currentPath.remove();
				}
			}
			
			//var currentStrokeWidth = this.attribute["stroke-width"] * me.json.scale;
			this.currentPath = me.paint.paper.path(me.path).attr({
				"stroke": this.attribute["stroke"],
				"stroke-width": currentStrokeWidth
			});
			//this.currentPath.transform("s" + me.json.scale + "," + me.json.scale + ",0, 0");
			
			break;
		case "arrow":
			me.path = "M" + this.orgX + "," + this.orgY + ",L" + this.nowX + " " + this.nowY;
			if (this.currentPath != null) {
				if (this.currentPath[0] != null) {
					this.currentPath.remove();
				}
			}
			
			//var currentStrokeWidth = this.attribute["stroke-width"] * me.json.scale;
			this.currentPath = me.paint.paper.path(me.path).attr({
				"stroke": this.attribute["stroke"],
				"stroke-width": currentStrokeWidth,
				"arrow-end": "classic-wide-long"
			});
			//this.currentPath.transform("s" + me.json.scale + "," + me.json.scale + ",0, 0");
			
			break;
		case "circle":
			var r = Math.sqrt(Math.pow(this.nowX - this.orgX, 2) + Math.pow(this.nowY - this.orgY, 2));
			me.path = getCircleToPath(this.orgX, this.orgY, r);
			if (this.currentPath != null) {
				if (this.currentPath[0] != null) {
					this.currentPath.remove();
				}
			}

			//var currentStrokeWidth = this.attribute["stroke-width"] * me.json.scale;
			this.currentPath = me.paint.paper.path(me.path).attr({
				"stroke": this.attribute["stroke"],
				"stroke-width": currentStrokeWidth
			});
			//this.currentPath.transform("s" + me.json.scale + "," + me.json.scale + ",0, 0");
			
			break;
		case "circle-fill":
			var r = Math.sqrt(Math.pow(this.nowX - this.orgX, 2) + Math.pow(this.nowY - this.orgY, 2));
			me.path = getCircleToPath(this.orgX, this.orgY, r);
			if (this.currentPath != null) {
				if (this.currentPath[0] != null) {
					this.currentPath.remove();
				}
			}

			//var currentStrokeWidth = this.attribute["stroke-width"] * me.json.scale;
			this.currentPath = me.paint.paper.path(me.path).attr({
				"fill": this.attribute["fill"],
				"stroke": this.attribute["stroke"],
				"stroke-width": currentStrokeWidth
			});
			//this.currentPath.transform("s" + me.json.scale + "," + me.json.scale + ",0, 0");
			
			break;
		case "rectangle":
			me.path = getRectToPath(this.orgX, this.orgY, this.nowX - this.orgX, this.nowY - this.orgY);
			if (this.currentPath != null) {
				if (this.currentPath[0] != null) {
					this.currentPath.remove();
				}
			}
			
			//var currentStrokeWidth = this.attribute["stroke-width"] * me.json.scale;
			this.currentPath = me.paint.paper.path(me.path).attr({
				"stroke": this.attribute["stroke"],
				"stroke-width": currentStrokeWidth
			});
			//this.currentPath.transform("s" + me.json.scale + "," + me.json.scale + ",0, 0");
			
			break;
		case "rectangle-fill":
			me.path = getRectToPath(this.orgX, this.orgY, this.nowX - this.orgX, this.nowY - this.orgY);
			if (this.currentPath != null) {
				if (this.currentPath[0] != null) {
					this.currentPath.remove();
				}
			}
			
			//var currentStrokeWidth = this.attribute["stroke-width"] * me.json.scale;
			this.currentPath = me.paint.paper.path(me.path).attr({
				"fill": this.attribute["fill"],
				"stroke": this.attribute["stroke"],
				"stroke-width": currentStrokeWidth
			});
			//this.currentPath.transform("s" + me.json.scale + "," + me.json.scale + ", 0, 0");
			
			break;
		}
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var onEnd = function (event, json) {
	var element = null;
	var message = null;

	//	so far, json is only used for text and text-box
	if (isEmpty(json)) json = null;

	var self = this;
	if (isEmpty(self.expanded)) self = window.whiteboard.paint.paint;

	if (self.expanded) {
		var me = self.data("this");
		
		//var id = guidGenerator();
		var uid = generateUID();
		
		var	actualStrokeWidth = self.attribute["stroke-width"],
			//currentStrokeWidth = (self.attribute["stroke-width"] * me.json.scale);
			currentStrokeWidth = actualStrokeWidth;
			
		//	lets set up most of the current attribute
		var	currentAttr = {
			"title":		me.userName + "\'s drawing",
			"stroke":		self.attribute["stroke"],
			"stroke-width":	currentStrokeWidth
		};
		
		var	actualAttr = {
			"title":		me.userName + "\'s drawing",
			"stroke":		self.attribute["stroke"],
			"stroke-width":	actualStrokeWidth
		};
		
		//	lets set up most of message
		var	message = {
			id:				uid,
			name:			me.userName,
			type:			'scribble',
			action:			'draw',
			path:			me.path,
			attr:			actualAttr,
			strokeWidth:	actualStrokeWidth
		};

		//	lets do a little bit of tidy up...
		if (self.currentPath != null) {
			if (self.currentPath[0] != null) {
				self.currentPath.remove();
			}
		}
		if (self.closurePath != null) {
			if (self.closurePath[0] != null) {
				self.closurePath.remove();
			}
		}

		//--------------------------------------------------------------------------
		//	draw the shape on the screen
		var transform = 's1, 1, 0, 0';
		switch (self.attribute["pencilShape"]) {
			case "scribble":
				element = me.paint.paper.path(me.path).attr(currentAttr).transform(transform).data("strokeWidth", currentStrokeWidth);
				message.type = "scribble";
				message.bbox = element.getBBox();
			break;
			case "scribble-fill":
				me.path = me.path + "Z";
				message.path = me.path;
				
				currentAttr.fill = self.attribute["fill"];
				actualAttr.fill = self.attribute["fill"];

				element = me.paint.paper.path(me.path).attr(currentAttr).transform(transform).data("strokeWidth", currentStrokeWidth);

				message.type = "scribble-fill";
				message.bbox = element.getBBox();
				message.attr = actualAttr;
			break;
			case "line":
				element = me.paint.paper.path(me.path).attr(currentAttr).transform(transform).data("strokeWidth", currentStrokeWidth);

				message.type = 'line';
				message.bbox = element.getBBox();
				message.para = [self.orgX, self.orgY, self.nowX, self.nowY];
			break;
			case "arrow":
				currentAttr["arrow-end"] = "classic-wide-long";
				actualAttr["arrow-end"] = "classic-wide-long";

				element = me.paint.paper.path(me.path).attr(currentAttr).transform(transform).data("strokeWidth", currentStrokeWidth);

				message.type = 'arrow';
				message.bbox = element.getBBox();
				message.para = [self.orgX, self.orgY, self.nowX, self.nowY];
				//message.attr = actualAttr;
			break;
			case "circle":
				element = me.paint.paper.path(me.path).attr(currentAttr).transform(transform).data("strokeWidth", currentStrokeWidth);

				message.type = 'circle';
				message.bbox = element.getBBox();
				message.para = [self.orgX, self.orgY, Math.sqrt(Math.pow(self.nowX - self.orgX, 2) + Math.pow(self.nowY - self.orgY, 2))];
			break;
			case "circle-fill":
				currentAttr.fill = self.attribute["fill"];
				actualAttr.fill = self.attribute["fill"];

				element = me.paint.paper.path(me.path).attr(currentAttr).transform(transform).data("strokeWidth", currentStrokeWidth);

				message.type = 'circle-fill';
				message.bbox = element.getBBox();
				message.para = [self.orgX, self.orgY, Math.sqrt(Math.pow(self.nowX - self.orgX, 2) + Math.pow(self.nowY - self.orgY, 2))];
				message.attr = actualAttr;
			break;
			case "rectangle":
				element = me.paint.paper.path(me.path).attr(currentAttr).transform(transform).data("strokeWidth", currentStrokeWidth);

				message.type = 'rectangle';
				message.bbox = element.getBBox();
				message.para = [self.orgX, self.orgY, self.nowX - self.orgX, self.nowY - self.orgY];
			break;
			case "rectangle-fill":
				currentAttr.fill = self.attribute["fill"];
				actualAttr.fill = self.attribute["fill"];

				element = me.paint.paper.path(me.path).attr(currentAttr).transform(transform).data("strokeWidth", currentStrokeWidth);

				message.type = 'rectangle-fill';
				message.bbox = element.getBBox();
				message.para = [self.orgX, self.orgY, self.nowX - self.orgX, self.nowY - self.orgY];
				message.attr = actualAttr;
			break;
			case "text": {
				if (json.type === "text-box") {
					var attr = {stroke: json.attr.fill, 'stroke-width': json.attr['stroke-width']};
					var text = me.paint.paper.text(475, 230, json.text).attr(json.attr).transform(transform);
					var bbox = text.getBBox();
					var box = me.paint.paper.rect(bbox.x, bbox.y, bbox.width, bbox.height).attr(attr);
					element = me.paint.paper.set(
						text,
						box
					);
					text.parent = element;
					window.whiteboard.paint.setAttrPencilShape("default");
					message.type = json.type;
					message.bbox = element.getBBox();
					message.para = [475, 230, json.text];
					message.attr = json.attr;
					me.path = "text";
				} else {
					element = me.paint.paper.text(475, 230, json.text).attr(json.attr).transform(transform);
					window.whiteboard.paint.setAttrPencilShape("default");
					message.type = json.type;
					message.bbox = element.getBBox();
					message.para = [475, 230, json.text];
					message.attr = json.attr;
					me.path = "text";
				}
			}
			break;
		}
		
		//--------------------------------------------------------------------------
		//	post element processing
		if ((!isEmpty(element)) && (!isEmpty(message)) && (!isEmpty(me.path))) {
			if (me.path = "text") me.path = "";

			//	send the shape out into the world
			var messageJSON = {
				type: 'sendobject',
				message: message
			}
			window.sendMessage(messageJSON);

			//	make sure we add this to our undo manager
			//um.push(message.id);

			//	lets attach our message to the element
			element.message = message;			

			/*
				this has been removed as we are now using FreeTransform

				//	add handlers to his object, basically see if we hover over it,
				//	drag it and so on....
				element.message = message;
				me.objects.attachHandler(element);
			*/

			//	lets attach a free transfrom to our created object
			attachFreeTransformToObject('always', me.paint.paper, element);

			var newElement = null;
			newElement = jQuery.extend(true, {}, element);	//	this clones the object

			//	lets push the newly created object onto our undo manager
			um.push({
				action: 'create',
				uid: element.freeTransform.subject.message.id,
				object: newElement
			});

			//	finish by cleaning up the local bits and pieces
			message = null;
			element = null;
			me.path = "";

			//	make sure paint is front and foremost...
			me.paint.toFront();
			
			//move the close image icon to the front...
			if (!isEmpty(me.whiteboardImageClose)) {
				me.whiteboardImageClose.getIcon().toFront();
			}
		}
	}
};

//----------------------------------------------------------------------------
var onMouseDown = function (event, x, y) {
	var me = this.data("this");
	var canvas_container = document.getElementById("canvas_container");
	var canvas = document.getElementById("canvas");

	var nowX = x - (canvas_container.offsetLeft + canvas.offsetLeft),
		nowY = y - (canvas_container.offsetTop + canvas.offsetTop);

	switch (this.attribute["pencilShape"]) {
	case "text":
		if (this.currentText != null) {
			if (this.currentText[0] != null) {
				this.currentText.remove();
			}
		}
		if(navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i)){
			alert("is ipad?= " + true);
			nowX = 475;
			nowY = 230;
		}

		var strokeWidth = this.attribute["stroke-width"];
		var fontSize = 12;
		var currentStrokeWidth = 1;
		switch (strokeWidth) {
		case 1:
			fontSize = 12;
			currentStrokeWidth = 1;
			break;
		case 2:
			fontSize = 24;
			currentStrokeWidth = 2;
			break;
		case 4:
			fontSize = 36;
			currentStrokeWidth = 3;
			break;
		case 8:
			fontSize = 48;
			currentStrokeWidth = 4;
			break;
		}

		var id = guidGenerator();

		var currentAttr = {
			"title": me.userName + "\'s drawing",
			"fill": this.attribute["stroke"],
			"stroke": "none",
			"stroke-width": currentStrokeWidth,
			"font-family": this.attribute["font"],
			"font-size": fontSize
		};
		var element = me.paint.paper.text(nowX, nowY, this.attribute["text"]).attr(currentAttr).transform("s" + me.json.scale + "," + me.json.scale + ", 0, 0");
		var para = new Array();
		para.push(nowX, nowY, this.attribute["text"]);

		var message = {
			id: id,
			name: me.userName,
			type: 'text',
			action: 'draw',
			para: para,
			attr: currentAttr,
			strokeWidth: currentStrokeWidth
		};

		var messageJSON = {
			type: 'sendobject',
			message: message
		}

		window.sendMessage(messageJSON);
		/*
			this has been removed as we are now using FreeTransform

			element.message = message;
			me.objects.attachHandler(element);
		*/

		//	lets attach a free transfrom to our created object
		attachFreeTransformToObject('always', me.paint.paper, element);

		this.attribute["pencilShape"] = "scribble";
		this.attribute["text"] = "";
		this.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_pencil.png)"
		});
		me.paint.toFront();
		if (!isEmpty(me.whiteboardImageClose)) {
			me.whiteboardImageClose.getIcon().toFront();
		}
		break;
	case "text-box":
		if (this.currentText != null) {
			if (this.currentText[0] != null) {
				this.currentText.remove();
			}
		}
		if (this.currentPath != null) {
			if (this.currentPath[0] != null) {
				this.currentPath.remove();
			}
		}
		
		if(navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i)){
			alert("is ipad?= "+true);
			nowX = 500;
			nowY = 250;
		}

		var strokeWidth = this.attribute["stroke-width"];
		var fontSize = 12;
		var currentStrokeWidth = 1;
		switch (strokeWidth) {
		case 1:
			fontSize = 12;
			currentStrokeWidth = 1;
			break;
		case 2:
			fontSize = 24;
			currentStrokeWidth = 2;
			break;
		case 4:
			fontSize = 36;
			currentStrokeWidth = 3;
			break;
		case 8:
			fontSize = 48;
			currentStrokeWidth = 4;
			break;
		}

		var id = guidGenerator();

		var currentAttr = {
			"title": me.userName + "\'s drawing",
			"fill": this.attribute["stroke"],
			"stroke": "none",
			"stroke-width": currentStrokeWidth,
			"font-family": this.attribute["font"],
			"font-size": fontSize
		};

		var element = me.paint.paper.text(nowX, nowY, this.attribute["text"]).attr(currentAttr)
		var BBox = element.getBBox();

		element.transform("s" + me.json.scale + "," + me.json.scale + ", 0, 0");
		element.box = me.paint.paper.rect(BBox.x-currentStrokeWidth, BBox.y, BBox.width+2*currentStrokeWidth, BBox.height);
		element.box.attr({"stroke": currentAttr["fill"], "stroke-width": currentStrokeWidth*me.json.scale}).transform("s" + me.json.scale + "," + me.json.scale + ", 0, 0").data("strokeWidth", currentStrokeWidth*me.json.scale);
		
		var para = new Array();
		para.push(nowX, nowY, this.attribute["text"],BBox.x-currentStrokeWidth, BBox.y, BBox.width+2*currentStrokeWidth, BBox.height);

		var message = {
			id: id,
			name: me.userName,
			type: 'text-box',
			action: 'draw',
			para: para,
			attr: currentAttr,
			strokeWidth: currentStrokeWidth
		};

		var messageJSON = {
			type: 'sendobject',
			message: message
		}
		window.sendMessage(messageJSON);

		/*
			this has been removed as we are now using FreeTransform


			element.message = message;
			me.objects.attachHandler(element);
		*/
		
		//	lets attach a free transfrom to our created object
		attachFreeTransformToObject('always', me.paint.paper, element);

		this.attribute["pencilShape"] = "scribble";
		this.attribute["text"] = "";
		this.attr({
			cursor: "url(" + window.URL_PATH + window.CHAT_ROOM_PATH + "resources/cursors/cursor_pencil.png)"
		});
		me.paint.toFront();
		if (!isEmpty(me.whiteboardImageClose)) {
			me.whiteboardImageClose.getIcon().toFront();
		}
		break;
	}
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var onMouseMove = function (event, x, y) {
	var me = this.data("this");
	var canvas_container = document.getElementById("canvas_container");
	var canvas = document.getElementById("canvas");
	var nowX = x - (canvas_container.offsetLeft + canvas.offsetLeft),
		nowY = y - (canvas_container.offsetTop + canvas.offsetTop);

	switch (this.attribute["pencilShape"]) {
	case "text":
		if (this.currentText != null) {
			if (this.currentText[0] != null) {
				this.currentText.remove();
			}
		}

		var strokeWidth = this.attribute["stroke-width"];
		var fontSize = 12;
		var currentStrokeWidth = 1;
		switch (strokeWidth) {
		case 1:
			fontSize = 12;
			currentStrokeWidth = 1;
			break;
		case 2:
			fontSize = 24;
			currentStrokeWidth = 2;
			break;
		case 4:
			fontSize = 36;
			currentStrokeWidth = 3;
			break;
		case 8:
			fontSize = 48;
			currentStrokeWidth = 4;
			break;
		}

		var currentAttr = {
			"fill": this.attribute["stroke"],
			"stroke": "none",
			"stroke-width": currentStrokeWidth,
			"font-family": this.attribute["font"],
			"font-size": fontSize
		};

		this.currentText = me.paint.paper.text(nowX, nowY, this.attribute["text"]).attr(currentAttr).transform("s" + me.json.scale + "," + me.json.scale + ", 0, 0");
		this.toFront();
		break;
	case "text-box":
		if (this.currentText != null) {
			if (this.currentText[0] != null) {
				this.currentText.remove();
			}
		}
		if (this.currentPath != null) {
			if (this.currentPath[0] != null) {
				this.currentPath.remove();
			}
		}

		var strokeWidth = this.attribute["stroke-width"];
		var fontSize = 12;
		var currentStrokeWidth = 1;
		switch (strokeWidth) {
		case 1:
			fontSize = 12;
			currentStrokeWidth = 1;
			break;
		case 2:
			fontSize = 24;
			currentStrokeWidth = 2;
			break;
		case 4:
			fontSize = 36;
			currentStrokeWidth = 3;
			break;
		case 8:
			fontSize = 48;
			currentStrokeWidth = 4;
			break;
		}

		var currentAttr = {
			"fill": this.attribute["stroke"],
			"stroke": "none",
			"stroke-width": currentStrokeWidth,
			"font-family": this.attribute["font"],
			"font-size": fontSize
		};

		this.currentText = me.paint.paper.text(nowX, nowY, this.attribute["text"]).attr(currentAttr);
		var BBox = this.currentText.getBBox();

		this.currentText.transform("s" + me.json.scale + "," + me.json.scale + ", 0, 0");

		this.currentPath = me.paint.paper.rect(BBox.x - currentStrokeWidth, BBox.y, BBox.width + 2 * currentStrokeWidth, BBox.height);
		this.currentPath.attr({"stroke": currentAttr["fill"], "stroke-width": currentStrokeWidth * me.json.scale}).transform("s" + me.json.scale + "," + me.json.scale + ", 0, 0");

		this.toFront();
		break;
	}
};

