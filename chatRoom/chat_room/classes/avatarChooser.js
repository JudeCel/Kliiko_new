var view = namespace('sf.ifs.View');
var socket = null;
/*
	json = {
		userId: int,			//
		sessionId: int,			//
		x: int,					//	default 0
		y: int,					//	default 0
		width: int,				//	default 400
		height: int,			//	default 265
		radius: float,			//	default 10
		injectInto: string		//	default ""
	}
*/
view.AvatarChooser = function (json, port, domain) {
	//	we need our own connection to the server
	//this.socket = io.connect(domain + ':' + port);//not work this.socket
    socket = io.connect("http://" + domain + ':' + port, {
        'reconnect': true,
        'reconnection delay': 500,
        'max reconnection attempts': 10
    });

	//	set up listeners...
    socket.data = {
		me: this
	}

    socket.on('avatarinfo', function(data) {
		var attributes = data.avatar_info.split(":");
		var gender = data.gender;

		switch(gender.toLowerCase()) {
			case 'f':
			case 'female':
				this.data.me.manifestation.head = 0;			//	set up a default for a female.
				this.data.me.manifestation.face = 4;			//	normal
				this.data.me.manifestation.hair = 0;
				this.data.me.manifestation.top = 0;
				this.data.me.manifestation.accessory = 0;
				this.data.me.manifestation.desk = 0;
			break;
			default:
				this.data.me.manifestation.head = 0;			//	set up a default for a female.
				this.data.me.manifestation.face = 4;			//	normal
				this.data.me.manifestation.hair = 6;
				this.data.me.manifestation.top = 0;
				this.data.me.manifestation.accessory = 5;
				this.data.me.manifestation.desk = 0;
			break;
		}

		if (!isEmpty(data.colour)) {
			this.data.me.manifestation.colour = colourToHex(parseInt(data.colour));
		} else {
			this.data.me.manifestation.colour = "#888888";
		}
		this.data.me.manifestation.name = data.firstName;

		this.data.me.manifestation.head = attributes[0];
		this.data.me.manifestation.face = attributes[1];
		this.data.me.manifestation.hair = attributes[2];
		this.data.me.manifestation.top = attributes[3];
		this.data.me.manifestation.accessory = attributes[4];
		this.data.me.manifestation.desk = attributes[5];

		this.data.me.manifestation.draw();
	});

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
	this.manifestation = new sf.ifs.View.AvatarRenderer(avatarJson);

	socket.emit('getavatarinfo', this.json.userId, this.json.sessionId);

	this.draw();
}

view.AvatarChooser.prototype.onAvatarInfo = function(data, type) {
	//	OK, lets draw our Chooser
	this.draw();
}

view.AvatarChooser.prototype.drawSelection = function(shapeAsString, shapeSet, options) {
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

	var startX = 125,
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
	var shape = null;
	while (((colY * 4) + colX) < shapeSetLength) {
		//	do we need to offset each element in our selection?
		if (typeof options.offsetX === "object") posX = posX + options.offsetX[ndx];
		if (typeof options.offsetY === "object") posY = posY + options.offsetY[ndx];

		transform = "t" + posX + "," + posY + " s" + options.scale;

		shape = shapeSet[ndx](this.json.paper);
		shape.transform(transform);
		shape.data("index", ndx);
		shape.data("this", this);
		shape.data("shape", shapeAsString);
		shape.click(function() {
			var me = this.data("this");
			var index = this.data("index");
			var shapeAsString = this.data("shape");

			switch(shapeAsString) {
				case "hair":
					me.manifestation.hair = index;
				break;
				case "top":
					me.manifestation.top = index;
				break;
				case "accessory":
					me.manifestation.accessory = index;
				break;
				case "desk":
					me.manifestation.desk = index;
				break;
			}

			me.manifestation.draw();

			//	lets update the db
			var avatarInfo = "" +
				me.manifestation.head + ":" +
				me.manifestation.face + ":" +
				me.manifestation.hair + ":" +
				me.manifestation.top + ":" +
				me.manifestation.accessory + ":" +
				me.manifestation.desk;

			socket.emit('setavatarinfo', me.json.userId, avatarInfo);
			if (!isEmpty(window.updateAvatar)) window.updateAvatar(me);
		})

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

/*view.AvatarChooser.prototype.drawAvatar = function() {
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

	var transform = "t15,50";

	var deskLabel = deskLabels[0](this.json.paper, this.colour);
	deskLabel.transform("t30,150");

	//	lets write our name on the label now
	var labelText = this.json.paper.text(75, 162, this.name).attr({'font-size': 10, fill: '#fff'});

	var head = heads[this.head](this.json.paper);
	head.transform(transform);

	var face = faces[this.face](this.json.paper);
	face.transform(transform);

	var hair = hairs[this.hair](this.json.paper);
	hair.transform(transform);

	var top = tops[this.top](this.json.paper);
	top.transform(transform);

	var accessory = accessories[this.accessory](this.json.paper);
	accessory.transform(transform);

	var desk = desks[this.desk](this.json.paper);
	desk.transform(transform);

	this.avatar.push(
		deskLabel,
		labelText,
		head,
		face,
		hair,
		top,
		accessory,
		desk
	);
}*/

view.AvatarChooser.prototype.draw = function() {
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

	this.chooser.push(this.json.paper.path(getRoundedRectToPath(
		this.json.x + 11,
		this.json.y + 11,
		136,
		176,
		10
	)).attr({
		fill: '#fff',
		stroke: '#bbb6b2',
		'stroke-width': 1
	}));

	this.chooser.push(this.json.paper.path(getRoundedRectToPath(
		this.json.x + 156,
		this.json.y + 11,
		230,
		176,
		10
	)).attr({
		fill: '#fff',
		stroke: '#bbb6b2',
		'stroke-width': 1
	}));

	var hairButton = buttonChoosers[6](this.json.paper);
	hairButton.transform("t156, 206").attr({"opacity": 0.5});

	this.chooser.push(hairButton);

	var topButton = buttonChoosers[2](this.json.paper);
	topButton.transform("t216, 206").attr({"opacity": 0.5});

	this.chooser.push(topButton);

	var accessoryButton = buttonChoosers[0](this.json.paper);
	accessoryButton.transform("t276, 206").attr({"opacity": 0.5});

	this.chooser.push(accessoryButton);

	var deskButton = buttonChoosers[4](this.json.paper);
	deskButton.transform("t336, 206").attr({"opacity": 0.5});

	this.chooser.push(deskButton);

	//-------------------------------------------------------------------------
	hairButton.data("this", this);
	topButton.data("this", this);
	accessoryButton.data("this", this);
	deskButton.data("this", this);

	//-------------------------------------------------------------------------
	var hairSelection = function(me) {
		me.drawSelection("hair", hairs, {
			scale: 0.8,
			offsetX: 0,
			offsetY: 0,
			incX: 56,
			incY: 50
		});
	};

	hairButton.click(function() {
		hairSelection(this.data("this"));
	});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	topButton.click(function() {
		var me = this.data("this");
		me.drawSelection("top", tops, {
			scale: 0.8,
			offsetX: 0,
			offsetY: -50,
			incX: 56,
			incY: 50
		});
	})

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	accessoryButton.click(function() {
		var me = this.data("this");
		me.drawSelection("accessory", accessories, {
			scale: 1,
			offsetX: 0,
			offsetY: [
				-50, 0, 0, 0,
				0, 0, 0, 0,
				20, 0, 0, 0
			],
			incX: 56,
			incY: 50
		});
	})

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	deskButton.click(function() {
		var me = this.data("this");
		me.drawSelection("desk", desks, {
			scale: 1,
			offsetX: [
				30, 15, 15, -30,
				30, -40, 45, 60,
				0, 30, 15, 30],
			offsetY: -60,
			incX: 40,
			incY: 50
		});
	})

	//-------------------------------------------------------------------------
	hairButton.hover(
		//	hover in
		function() {
			var animationHoverIn = Raphael.animation({"opacity": 1.0}, 500);

			if (typeof this.animate != 'undefined') {
				if (!this.removed) this.animate(animationHoverIn.delay(0));
			}
		},
		//	hover out
		function() {
			var animationHoverOut = Raphael.animation({"opacity": 0.5}, 500);

			if (typeof this.animate != 'undefined') {
				if (!this.removed) this.animate(animationHoverOut.delay(0));
			}
		}
	);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	topButton.hover(
		//	hover in
		function() {
			var animationHoverIn = Raphael.animation({"opacity": 1.0}, 500);

			if (typeof this.animate != 'undefined') {
				if (!this.removed) this.animate(animationHoverIn.delay(0));
			}
		},
		//	hover out
		function() {
			var animationHoverOut = Raphael.animation({"opacity": 0.5}, 500);

			if (typeof this.animate != 'undefined') {
				if (!this.removed) this.animate(animationHoverOut.delay(0));
			}
		}
	);

	accessoryButton.hover(
		//	hover in
		function() {
			var animationHoverIn = Raphael.animation({"opacity": 1.0}, 500);

			if (typeof this.animate != 'undefined') {
				if (!this.removed) this.animate(animationHoverIn.delay(0));
			}
		},
		//	hover out
		function() {
			var animationHoverOut = Raphael.animation({"opacity": 0.5}, 500);

			if (typeof this.animate != 'undefined') {
				if (!this.removed) this.animate(animationHoverOut.delay(0));
			}
		}
	);

	deskButton.hover(
		//	hover in
		function() {
			var animationHoverIn = Raphael.animation({"opacity": 1.0}, 500);

			if (typeof this.animate != 'undefined') {
				if (!this.removed) this.animate(animationHoverIn.delay(0));
			}
		},
		//	hover out
		function() {
			var animationHoverOut = Raphael.animation({"opacity": 0.5}, 500);

			if (typeof this.animate != 'undefined') {
				if (!this.removed) this.animate(animationHoverOut.delay(0));
			}
		}
	);

	//-------------------------------------------------------------------------
	//	by default, lets show all the hair style selections
	hairSelection(this);

	//-------------------------------------------------------------------------
	//	OK, lets draw our avatar now
	this.manifestation.draw();
}

