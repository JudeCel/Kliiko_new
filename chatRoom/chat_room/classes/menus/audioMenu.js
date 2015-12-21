var view = namespace('sf.ifs.View');

/*
	format for the json
	{
		x:	 				int,
		y:					int,
		width:				int,
		height:				int,
		radius:				int,
		thisMain:			pointer,		//	pointer to the "this" structure in topic.html
		paper:				pointer			//	pointer to the canvas we are drawing on
	}
*/
view.AudioMenu = function(json) {
	this.json = json;

	this.audioMenu = null;

	this.resources = JSON.parse(this.json.data);

	this.dashboard = new sf.ifs.View.Dashboard();
};

view.AudioMenu.prototype.draw = function() {
	//	make sure we remove any old objects first
	if (this.audioMenu) {
		if (this.audioMenu[0] != null) this.audioMenu.remove();
	}

	this.dashboard.toFront();

	var width = this.json.paper.canvas.clientWidth ? this.json.paper.canvas.clientWidth : this.json.paper.width;
	var height = (this.json.paper.canvas.clientHeight ? this.json.paper.canvas.clientHeight : this.json.paper.height);	//	leave a space for the playback controller

	var cx = (width / 2),
		cy = (height / 2);

	var radius = cx;
	if (cy < cx) radius = cy;

	this.audioMenu = this.json.paper.set();

	//	lets add an "+" (add) button
	var buttonLabelColour = BUTTON_BACKGROUND_COLOUR;
	var buttonLabelColourHover = BUTTON_BORDER_COLOUR;
	var buttonLabelStrokeColour = BUTTON_BORDER_COLOUR;

	var buttonAttrLabel = {
		fill:			buttonLabelColour,
		stroke:			buttonLabelStrokeColour,
		"stroke-width":	2,
		opacity:		0.5,
		title:			"Add an Audio"
	};

	var buttonAttrLabelHover = {
		fill:			buttonLabelColourHover,
		stroke:			buttonLabelStrokeColour,
		"stroke-width":	2,
		opacity: 1,
		title:			"Add an Audio"
	};

	var buttonAttrLabelText = {
		'font-size':	16,
		fill:			'#fff'
	};

	thisMain.checkFileExtension = function() {
		var filePath = document.getElementById('uploadedfile').value.toLowerCase();

		if (filePath.indexOf('.') == -1) return false;

		var validExtensions = new Array();
		var ext = filePath.substring(filePath.lastIndexOf('.') + 1).toLowerCase();

		validExtensions[0] = 'mp3';
		validExtensions[1] = 'wav';


		for(var i = 0; i < validExtensions.length; i++) {
		    if(ext == validExtensions[i])
		        return true;
		}

		alert('The file extension ' + ext.toUpperCase() + ' is not allowed for Audio files.  We only accept the followin file types: mp3 and wav');

		document.getElementById('uploadedfile').value = null;

		return false;
	};

	var onClick = function() {
		//	firstly, lets make sure we remote the menu
		this.thisLocal.hide();

		audioMenuAddHandler();
	};

	buttonJSON = {
		position: {
			x:	 				this.json.x + 22,
			y:					this.json.y + 24
		},
		margin:					10,			//	gap between the text and the menu item
		radius:					5,			//	radius for the rounded corners of the menu item
		label:					"+",
		attrLabel:				buttonAttrLabel,
		attrLabelHover:			buttonAttrLabelHover,
		attrLabelText:			buttonAttrLabelText,
		click:					onClick,
		thisLocal:				this,
		thisMain:				this.json.thisMain,
		paper:					this.json.paper		//	pointer to the canvas we are drawing on
	};

	var background = this.json.paper.path(getRoundedRectToPath(this.json.x, this.json.y, this.json.width, this.json.height, this.json.radius)).attr({
		fill: MENU_BACKGROUND_COLOUR,
		"opacity": 0.33,
		stroke: MENU_BORDER_COLOUR,
		"stroke-width": 5,
		"stroke-opacity": 1
	});

	var title = this.json.paper.text(this.json.x + 50, this.json.y + 24, this.json.title);
	title.attr({'fill': "white", 'font-size': 24, 'text-anchor': 'start'});

	var onCloseClick = function() {
		thisMain.audioMenu.hide();
	};

	var iconJSON = {
		x:			this.json.x + this.json.width - DEFAULT_ICON_RADIUS,
		y:			this.json.y - DEFAULT_ICON_RADIUS,
		click:		onCloseClick,
		path:		getClosePath(),
		thisMain:	this.json.thisMain,
		paper:		this.json.paper
	};

	var close = new sf.ifs.View.Icon(iconJSON);
	close.draw();

	var buttonAdd = new sf.ifs.View.Button(buttonJSON);
	buttonAdd.draw();

	this.audioMenu.push(
		background,
		buttonAdd.button,
		title,
		close.getIcon()
	);

	//	initial resource position
	var buttonPosition = {
		x: this.json.x + 20,
		y: this.json.y + 60
	};

	var buttonAdd = null;
	var buttonJSON = null;
	var audioJSON = null;
	var data = null;

	for (var ndx = 0, rl = this.resources.length; ndx < rl; ndx++) {
		data = decodeURI(this.resources[ndx].JSON);
		resourceId = this.resources[ndx].id;
		audioJSON = JSON.parse(data);
		var title = (!isEmpty(audioJSON.title)) ? audioJSON.title : audioJSON.name;
		buttonJSON = {
			id:					resourceId,
			menuLayer: 			this.audioMenu,
			position:			buttonPosition,
			margin:				5,
			radius:				1,
			type:				"audio",
			label:				window.URL_PATH + window.CHAT_ROOM_PATH + "uploads/" + audioJSON.name,
			title:				title,
			hoverHint: 			"Drag Audio onto Console",
			attrTitle: 	{
				'fill': "#fff",
				'font-size': 12
			},
			size: {
				width:		100,
				height:		56
			},
			attrLabel: {						//	background for our menu item
				stroke: "#fff",
				"stroke-width": 5
			},
			attrLabelHover: {					//	background for our menu when hovering over it
				stroke: "#fff",
				"stroke-width": 5
			},
			//click:				pointer,		//	pointer to a callback function
			draggable:			true,
			onDragUp:			this.json.thisMain.audioMenuResourceOnUp,
			targetRect: [
				window.topic.getConsole().getTargetAsJSON()
			],
			/*
			targetRect: [{
				name:		"table",
				x:			cx - 50,
				y:			cy + 8,
				width: 		100,
				height:		56
			}],
			*/
			thisMain:			this.json.thisMain,
			paper:				this.json.paper,
            menu:               this,
            resourceIndex:      ndx
		};


		buttonAdd = new sf.ifs.View.Button(buttonJSON);
		buttonAdd.draw();

		this.audioMenu.push(buttonAdd.button);			//	lets keep track of all our resources

		buttonPosition.x = buttonPosition.x + 110;
		if ((buttonPosition.x + 100) > (this.json.x + this.json.width)) {
			buttonPosition.x = this.json.x + 20;
			buttonPosition.y = buttonPosition.y + 86;
		}
	}


	//	lets show our menu
	if (this.audioMenu.animate) {
		var animationInit = Raphael.animation({"opacity": 0.75}, 500, function() {});
		if (!this.audioMenu.removed) this.audioMenu.animate(animationInit.delay(0));
	}

	var targetRect = window.topic.getConsole().getTargetAsJSON();
	if (!isEmpty(this.target)) {
		this.target.remove();
		this.target = null;
	}
	this.targetRect = this.json.paper.rect(targetRect.x, targetRect.y, targetRect.width, targetRect.height).attr({stroke: "#8080ff", "stroke-width": 2, "stroke-dasharray": "-", "fill-opacity": 0.25});
	this.audioMenu.push(this.targetRect);
};

view.AudioMenu.prototype.show = function() {
	this.audioMenu.attr({
		fill: "black",
		"opacity": 0.0,
		//stroke: BORDER_COLOUR,
		//"stroke-width": 2,
		"stroke-opacity": 1
	});


	if (this.audioMenu.animate) {
		var animationShow = Raphael.animation({"opacity": 0.75}, 500);
		if (!this.audioMenu.removed) this.audioMenu.animate(animationShow.delay(0));
	}
};

view.AudioMenu.prototype.hide = function() {
	this.dashboard.toBack();

	this.audioMenu.attr({
		fill: "black",
		"opacity": 0.5,
		"stroke-opacity": 1
	});


	if (this.audioMenu.animate) {
		//	make sure our animation callback and see the main area
		this.audioMenu.data("this", this);

		var animationHide = Raphael.animation({"opacity": 0}, 500, function() {
			audioMenuCleanup();
		});

		if (!this.audioMenu.removed) this.audioMenu.animate(animationHide.delay(0));
	}
};

view.AudioMenu.prototype.destroy = function() {
	var buttonElement = null;
	while (this.audioMenu.length > 0) {
		buttonElement = this.audioMenu.splice(0, 1);
		buttonElement.remove();
	}

	this.audioMenu = null;
};
