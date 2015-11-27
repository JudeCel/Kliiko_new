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
view.ImageMenu = function(json) {
	this.json = json;
	
	this.imageMenu = null;
	
	this.resources = JSON.parse(this.json.data);
	
	this.dashboard = new sf.ifs.View.Dashboard();
};

view.ImageMenu.prototype.draw = function() {
	//	make sure we remove any old objects first
	if (this.imageMenu) {
		if (this.imageMenu[0] != null) this.imageMenu.remove();
	}
	
	this.dashboard.toFront();
	
	var width = this.json.paper.canvas.clientWidth ? this.json.paper.canvas.clientWidth : this.json.paper.width;
	var height = (this.json.paper.canvas.clientHeight ? this.json.paper.canvas.clientHeight : this.json.paper.height);	//	leave a space for the playback controller
	
	var cx = (width / 2),
		cy = (height / 2);
		
	var radius = cx;
	if (cy < cx) radius = cy;
	
	this.imageMenu = this.json.paper.set();

	//	lets add an "+" (add) button
	var buttonLabelColour = BUTTON_BACKGROUND_COLOUR;
	var buttonLabelColourHover = BUTTON_BORDER_COLOUR;
	var buttonLabelStrokeColour = BUTTON_BORDER_COLOUR;

	var buttonAttrLabel = {
		fill:			buttonLabelColour,
		stroke:			buttonLabelStrokeColour,
		"stroke-width":	2,
		opacity:		0.5,
		title:			"Add an Image"
	};
	
	var buttonAttrLabelHover = {
		fill:			buttonLabelColourHover,
		stroke:			buttonLabelStrokeColour,
		"stroke-width":	2,
		opacity: 1,
		title:			"Add an Image"
	};
	
	var buttonAttrLabelText = {
		'font-size':	16,
		fill:			'#fff'
	};
	
	var onClick = function() {
		//	firstly, lets make sure we remove the menu
		this.thisLocal.hide();
		
		imageMenuAddHandler();
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
		thisMain.imageMenu.hide();
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

	this.imageMenu.push(
		background,
		buttonAdd.button,
		title,
		close.getIcon()
	);

	//	initial resource position
	var buttonPosition = {
		x: this.json.x + 10,
		y: this.json.y + 70
	};
	
	var buttonAdd = null;
	var buttonJSON = null;
	var imageJSON = null;
	var data = null;
	var id = null;

	
	for (var ndx = 0, rl = this.resources.length; ndx < rl; ndx++) {
		data = decodeURI(this.resources[ndx].jSON);
		resourceId = this.resources[ndx].id;
		imageJSON = JSON.parse(data);
		var title = (!isEmpty(imageJSON.title)) ? imageJSON.title : imageJSON.name;
		buttonJSON = {
			id:					resourceId,
			menuLayer: 			this.imageMenu,
			position:			buttonPosition,
			margin:				5,
			radius:				1,
			type:				"image",
			label:				window.URL_PATH + window.CHAT_ROOM_PATH + "uploads/" + imageJSON.name,
			title:				title, 
			hoverHint: 			"Drag Image onto Whiteboard",
			attrTitle: 	{
				'fill': "#fff", 
				'font-size': 12
			},
			actualSize: {
				width:		imageJSON.width,
				height:		imageJSON.height
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
			onDragUp:			this.json.thisMain.imageMenuResourceOnUp,
			targetRect: [
				whiteboard.getTargetAsJSON()
			],
			thisMain:			this.json.thisMain,
			paper:				this.json.paper,
            menu:               this,
            resourceIndex:      ndx
        };
		
		
		buttonAdd = new sf.ifs.View.Button(buttonJSON);
		buttonAdd.draw();
		
		this.imageMenu.push(buttonAdd.button);			//	lets keep track of all our resources

		buttonPosition.x = buttonPosition.x + 110;
		if ((buttonPosition.x + 100) > (this.json.x + this.json.width)) {
			buttonPosition.x = this.json.x + 10;
			buttonPosition.y = buttonPosition.y + 86;
		}
	}


	//	lets show our menu
	if (this.imageMenu.animate) {
		var animationInit = Raphael.animation({"opacity": 0.75}, 500, function() {});
		if (!this.imageMenu.removed) this.imageMenu.animate(animationInit.delay(0));
	}

	var targetRect = whiteboard.getTargetAsJSON();
	if (!isEmpty(this.target)) {
		this.target.remove();
		this.target = null;
	}
	this.targetRect = this.json.paper.rect(targetRect.x, targetRect.y, targetRect.width, targetRect.height).attr({stroke: "#8080ff", "stroke-width": 2, "stroke-dasharray": "-", "fill-opacity": 0.25});	
	this.imageMenu.push(this.targetRect);
};

view.ImageMenu.prototype.show = function() {
	this.imageMenu.attr({
		fill: "black",
		"opacity": 0.0,
		"stroke-opacity": 1
	});
	
	if (this.imageMenu.animate) {
		var animationShow = Raphael.animation({"opacity": 0.75}, 500);
	
		if (!this.imageMenu.removed) this.imageMenu.animate(animationShow.delay(0));
	}
};

view.ImageMenu.prototype.hide = function() {
	this.dashboard.toBack();
	
	this.imageMenu.attr({
		fill: "black",
		"opacity": 0.5,
		"stroke-opacity": 1
	});
	
	//	make sure our animation callback and see the main area
	this.imageMenu.data("this", this);

	if (this.imageMenu.animate) {
		var animationHide = Raphael.animation({"opacity": 0}, 500, function() {
			imageMenuCleanup();
		});
	
		if (!this.imageMenu.removed) this.imageMenu.animate(animationHide.delay(0));
	}
};


view.ImageMenu.prototype.destroy = function() {
	var buttonElement = null;
	while (this.imageMenu.length > 0) {
		buttonElement = this.imageMenu.splice(0, 1);
		buttonElement.remove();
	}
	
	this.imageMenu = null;
};

