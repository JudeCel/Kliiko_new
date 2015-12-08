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
view.TopicMenu = function(json) {
	this.json = json;

	this.topicMenu = null;

	this.resources = JSON.parse(this.json.data);

	this.dashboard = paperDashboard.set();
};

view.TopicMenu.prototype.clearDashboard = function () {
	var item = null;
	while (this.dashboard.length > 0) {
		item = this.dashboard.pop();
		if (!isEmpty(item)) {
			try {
				item.remove();
			} catch(e) {};
		}
	}
};

view.TopicMenu.prototype.toFront = function() {
	var divDashboard = document.getElementById("dashboard");

	this.clearDashboard();

	var canvasWidth = paperDashboard.canvas.clientWidth ? paperDashboard.canvas.clientWidth : paperDashboard.width,
		canvasHeight = paperDashboard.canvas.clientHeight ? paperDashboard.canvas.clientHeight : paperDashboard.height;

	//	lets paint our dashboard
	var areaRadius = 16;
	this.canvasBorder = paperDashboard.path(getRoundedRectToPath(0, 0, (canvasWidth - 0), (canvasHeight - 0), areaRadius));
	this.canvasBorder.attr({fill: "#000", "fill-opacity": 0.0, stroke: "none", "stroke-width": 0, "stroke-opacity": 0});
	this.dashboard.push(this.canvasBorder);

	this.canvasBorder.data("this", this);
	this.canvasBorder.click(function() {
		var divTopicMenu = document.getElementById("topicMenu");
		divTopicMenu.style.display = "none";

		var me = this.data("this");
		me.json.thisMain.topicMenu.hide();

		var dashboardHTML = document.getElementById("dashboard-html");
		dashboardHTML.style.display = "none";

		var dashboardJPlayerVideoHTML = document.getElementById("dashboard-jplayer-video-html");
		dashboardJPlayerVideoHTML.style.display = "none";

		var dashboardJPlayerAudioHTML = document.getElementById("dashboard-jplayer-audio-html");
		dashboardJPlayerAudioHTML.style.display = "none";

		var divDashboard = document.getElementById("dashboard");
		divDashboard.style.zIndex = -3;
		me.clearDashboard();
	});

	divDashboard.style.zIndex = 3;
};

view.TopicMenu.prototype.draw = function() {
	//	make sure we remove any old objects first
	if (this.topicMenu) {
		if (this.topicMenu[0] != null) this.topicMenu.remove();
	}

	this.toFront();

	var width = this.json.paper.canvas.clientWidth ? this.json.paper.canvas.clientWidth : this.json.paper.width;
	var height = (this.json.paper.canvas.clientHeight ? this.json.paper.canvas.clientHeight : this.json.paper.height);	//	leave a space for the playback controller

	var divTopicMenu = document.getElementById("topicMenu");
	var divHeight = height + 5;
	if (divHeight > 552) divHeight = 552;	//	maximum height;
	divTopicMenu.style.height = divHeight + "px";

	var cx = (width / 2),
		cy = (height / 2);

	var radius = cx;
	if (cy < cx) radius = cy;

	this.topicMenu = this.json.paper.set();

	//	lets add an "+" (add) button
	var buttonLabelColour = "#df6a68";
	var buttonLabelColourHover = BORDER_COLOUR
	var buttonLabelStrokeColour = "#fff";

	var buttonAttrLabel = {
		fill:			buttonLabelColour,
		stroke:			buttonLabelStrokeColour,
		"stroke-width":	2,
		opacity:		0.5,
		title:			"Add an Image"
	}

	var buttonAttrLabelHover = {
		fill:			buttonLabelColourHover,
		stroke:			buttonLabelStrokeColour,
		"stroke-width":	2,
		opacity: 1,
		title:			"Add an Image"
	}

	var buttonAttrLabelText = {
		'font-size':	16,
		fill:			'#fff'
	}

	var background = this.json.paper.path(getRoundedRectToPath(this.json.x, this.json.y, this.json.width, this.json.height, this.json.radius)).attr({
		fill: MENU_BACKGROUND_COLOUR,
		"opacity": 0.0,
		stroke: MENU_BACKGROUND_COLOUR,
		"stroke-width": 0,
		"stroke-opacity": 1
	});

	this.topicMenu.push(
		background
	)

	//	initial resource position
	var buttonPosition = {
		x: this.json.x + 8,
		y: this.json.y + 25
	}

	var textWidth = this.json.width;
	var textHeight = 40;

	var buttonAdd = null;
	var buttonJSON = null;
	var strokeColour = "#fff";
	for (var ndx = 0, rl = this.resources.length; ndx < rl; ndx++) {
		if (this.resources[ndx].status === "Closed") continue;

		if (this.resources[ndx].active === true) {
			strokeColour = TEXT_COLOUR;
		} else {
			strokeColour = "#000";
		}

		buttonJSON = {
			position:			buttonPosition,
			margin:				5,
			radius:				0,
			type:				"text",
			label:				this.resources[ndx].name,
			active:		this.resources[ndx].active,
			counterId:			this.resources[ndx].id,
			showCounter:		true,
			size: {
				width:			textWidth,
				height:			textHeight
			},
			attrLabelText: {
				'font-size':	18,
				fill:			strokeColour,
				'text-anchor':	"start"
			},
			attrLabel: {						//	background for our menu item
				fill:	"#fff",
				"stroke-width": 0
			},
			attrLabelHover: {					//	background for our menu when hovering over it
				stroke: "#fff",
				"stroke-width": 5
			},
			click:	function(json) {
				var currentTopic = null;
				for (var ndx = 0, tl = thisMain.topics.length; ndx < tl; ndx++) {
					currentTopic = thisMain.topics[ndx];
					if (currentTopic.name === json.text) {
						window.topicID = currentTopic.id;
						window.topicTitle = json.text;

						//	make sure we clean up the dashboard first...
						window.getDashboard().tidyUp();
						thisMain.setTopic(currentTopic.id, false);

						var divTopicMenu = document.getElementById("topicMenu");
						divTopicMenu.style.display = "none";

						break;		//	no need to stay inside this loop
					}
				}
				thisMain.topicMenu.hide();
			},
			thisMain:			this.json.thisMain,
			paper:				this.json.paper
		}


		buttonAdd = new sf.ifs.View.Button(buttonJSON);
		buttonAdd.draw();

		this.topicMenu.push(buttonAdd.button);			//	lets keep track of all our resources

		buttonPosition.y = (buttonPosition.y + textHeight + this.json.margin);
	}


	//	lets show our menu
	if (background.animate) {
		var animationInit = Raphael.animation({"opacity": 0.9}, 500);

		if (!background.removed) background.animate(animationInit.delay(0));
	}
};

view.TopicMenu.prototype.show = function() {
	this.topicMenu.attr({
		fill: "black",
		"opacity": 0.0,
		"stroke-opacity": 1
	})

	if (this.topicMenu.animate) {
		var animationShow = Raphael.animation({"opacity": 0.5}, 500);

		if (!this.topicMenu.removed) this.topicMenu.animate(animationShow.delay(0));
	}
};

view.TopicMenu.prototype.hide = function() {
	this.dashboard.toBack();

	this.topicMenu.attr({
		fill: "black",
		"opacity": 0.5,
		"stroke-opacity": 1
	});

	//	make sure our animation callback and see the main area
	if (this.topicMenu.animate) {
		this.topicMenu.data("this", this);

		var animationHide = Raphael.animation({"opacity": 0}, 500, function() {
			topicMenuCleanup();
		});

		if (!this.topicMenu.removed) this.topicMenu.animate(animationHide.delay(0));
	}
};

view.TopicMenu.prototype.destroy = function() {
	var buttonElement = null;
	while (this.topicMenu.length > 0) {
		buttonElement = this.topicMenu.splice(0, 1);
		buttonElement.remove();
	}

	this.topicMenu = null;
}
