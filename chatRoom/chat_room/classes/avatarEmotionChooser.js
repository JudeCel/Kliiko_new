var view = namespace('sf.ifs.View');

/*
	json = {
		userId: int,			//	
		x: int,					//	default 0
		y: int,					//	default 0
		width: int,				//	default 400
		height: int,			//	default 265	
		radius: float,			//	default 10
		injectInto: string		//	default ""
	}
*/
view.AvatarEmotionChooser = function (json) {
	//	we need our own connection to the server
	this.json = json;

	//	set up some defaults
	if (typeof this.json.x === "undefined") this.json.x = 0;
	if (typeof this.json.y === "undefined") this.json.y = 10;
	if (typeof this.json.width === "undefined") this.json.width = 400;
	if (typeof this.json.height === "undefined") this.json.height = 255;
	if (typeof this.json.radius === "undefined") this.json.radius = 10;

	this.json.paper = Raphael(this.json.injectInto);

	this.chooser = this.json.paper.set();

	this.avatar = this.json.paper.set();
	this.shapes = this.json.paper.set();

	this.colour = '#888888';	//	default to a boring middle of the range grey
	this.name = 'untitled';

	var avatarJson = {
		paper: this.json.paper
	}
	//this.manifestation = new sf.ifs.View.AvatarRenderer(avatarJson);

	this.draw();
}

view.AvatarEmotionChooser.prototype.onAvatarInfo = function(data, type) {
	//	OK, lets draw our Chooser
	this.draw();
}

view.AvatarEmotionChooser.prototype.drawSelection = function(shapeAsString, shapeSet, options) {
	if (this.shapes) {
		for (var ndxOuter = 0, nco = this.shapes.length; ndxOuter < nco; ndxOuter++) {
			for (var ndxInner = 0, nci = this.shapes[ndxOuter].length; ndxInner < nci; ndxInner++) {
				if (this.shapes[ndxOuter][ndxInner]) {
					if (!this.shapes[ndxOuter][ndxInner].removed) {
						this.shapes[ndxOuter][ndxInner].remove();
					}
				}
			}
		}
	}

	if (isEmpty(options)) {
		//	set up defaults
		options = {
			scale: 1,
			offsetX: 0,
			offsetY: 0,
			incX: 56,
			incY: 50
		}
	} else {
		options.scale = (!isEmpty(options.scale)) ? options.scale : 1;
		options.offsetX = (!isEmpty(options.offsetX)) ? options.offsetX : 0;
		options.offsetY = (!isEmpty(options.offsetY)) ? options.offsetY : 0;
		options.incX = (!isEmpty(options.incX)) ? options.incX : 56;
		options.incY = (!isEmpty(options.incY)) ? options.incY : 50;
	}

	var shapeSetLength = shapeSet.length;

	var ndx = 0;		//	shape to show

	var startX = -10,
		startY = 25;

	if (typeof options.offsetX === "number") startX = startX + options.offsetX;
	if (typeof options.offsetY === "number") startY = startY + options.offsetY;

	var incX = options.incX,
		incY = options.incY;

	var colX = 0,
		colY = 0;

	var posX = startX,
		posY = startY;

	var transform = null;
	var head = null;
	var shape = null;
	while (((colY * 4) + colX) < shapeSetLength) {
		//	do we need to offset each element in our selection?
		if (typeof options.offsetX === "object") posX = posX + options.offsetX[ndx];
		if (typeof options.offsetY === "object") posY = posY + options.offsetY[ndx];

		transform = "t" + posX + "," + posY + " s" + options.scale;

		head = heads[0](this.json.paper);
		head.transform(transform);
		head.data("index", ndx);
		head.data("this", this);
		head.data("shape", shapeAsString);
		this.shapes.push(head);

		shape = shapeSet[ndx](this.json.paper);
		shape.transform(transform);
		shape.data("index", ndx);
		shape.data("this", this);
		shape.data("shape", shapeAsString);

		var clickFunction = function() {
			var me = this.data("this");
			var index = this.data("index");
			var shapeAsString = this.data("shape");

			window.dashboard.toBack();
			window.dashboard.close();

			var emotion = "normal";

			switch(index) {
				case 0:
					emotion = "angry";
				break;
				case 1:
					emotion = "confused";
				break;
				case 2:
					emotion = "smiling";
				break;
				case 3:
					emotion = "love";
				break;
				case 4:
					emotion = "normal";
				break;
				case 5:
					emotion = "upset";
				break
				case 6:
					emotion = "surprised";
				break;
			}

			window.chatAvatar.setEmotion(emotion);
		}

		head.click(clickFunction);
		shape.click(clickFunction);
		
		this.shapes.push(shape);

		//	update our position
		colX = colX + 1;
		if (colX === 4) {
			colX = 0
			colY = colY + 1;

			posY = posY + incY;
			posX = startX;
		} else {
			posX = posX + incX;
		}

		ndx = ndx + 1;
	}
}

view.AvatarEmotionChooser.prototype.draw = function() {
	if (this.chooser) {
		for (var ndx = 0, nc = this.chooser.length; ndx < nc; ndx++) {
			if (this.chooser[ndx]) this.chooser[ndx].remove();
		}
	}

	this.chooser.push(this.json.paper.path(getRoundedRectToPath(
		this.json.x + 1,
		this.json.y + 1,
		this.json.width - 2,
		this.json.height - 2,
		this.json.radius
	)).attr({
		fill: '90-#dbd6d2-#fbf6f2',
		stroke: '#bbb6b2',
		'stroke-width': 2
	}));

	//-------------------------------------------------------------------------
	var facesSelection = function(me) {
		me.drawSelection("face", optFaces, {
			scale: 0.8,
			offsetX: 0,
			offsetY: 0,
			incX: 100,
			incY: 100
		});
	};

	//-------------------------------------------------------------------------
	//	by default, lets show all the hair style selections
	facesSelection(this);

	//-------------------------------------------------------------------------
	//	OK, lets draw our avatar now
	//this.manifestation.draw();
}

