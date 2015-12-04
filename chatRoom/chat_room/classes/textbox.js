var view = namespace('sf.ifs.View');

view.Textbox = function() {
	this.textbox = paperTextbox.set();

	this.json = {
		title: "Input Text Content",
		font: "Text Font",
		size: "Text Size",
		button: "Done"
	}

	this.type = "text";

	var textarea = '<textarea id="textbox-textarea" autofocus="autofocus" style="position: absolute; left:130px; top: 180px; height: 120px; width: 400px; resize: none; color: black;"';

	if ((window.role != 'facilitator') && (window.role != 'co-facilitator')) {
		textarea = textarea + ' maxlength="50"';
	}

	textarea = textarea + ' ></textarea>';

	this.movePaths = getWhiteboardMovePaths();

	var html =	'<div style="position:relative; left:0px; top:0px; width:0px; height: 0px;">' +
				'<label style="position: absolute; left: 50px; top: 130px; width: 700px; font-size:30px;">' + this.json.title + '</label>' +
				textarea +
				'<label style="position: absolute; left: 50px; top: 340px; width: 700px; font-size:16px;">To move text on the Whiteboard, click on&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;symbol</label>' +
				'<label style="position: absolute; left: 530px; top: 340px; font-size:24px;" onclick="view.Textbox.prototype.done()">' + this.json.button + '</label>' +
		 	 	'</div>';

	this.html = html;

	this.canvasBorder = null;
	this.submitButton = null;
}

//----------------------------------------------------------------------------
view.Textbox.prototype.done = function() {
	var type = window.textbox.getTextbox();

	if (isEmpty(type)) type = "text";	//	default

	var text = document.getElementById("textbox-textarea").value;
	var font = 'Arial';
	var fontSize = 24;

	var paint = window.whiteboard.paint;

	paint.paint.attribute["font"] = font;
	paint.paint.attribute["text"] = text;

	if (text != "") {
		paint.setAttrPencilShape("text");
	}

	//	lets fake an onEnd event
	var json = {
		text: text,
		attr: {
			"fill": paint.paint.attribute["stroke"],
			"stroke": "none",
			"stroke-width": paint.paint.attribute["stroke-width"],
			"font-family": font,
			"font-size": fontSize,
			"text-anchor": "start"
		},
		type: type
	};

	onEnd(type, json);
	paint.paint.undrag();

	window.textbox.toBack();
};

//----------------------------------------------------------------------------
view.Textbox.prototype.clearTextbox = function () {
	var item = null;
	while (this.textbox.length > 0) {
		item = this.textbox.pop();
		item.remove();
	}
}

//----------------------------------------------------------------------------
view.Textbox.prototype.toFront = function() {
	var divTextbox = document.getElementById("textbox");
	divTextbox.style.zIndex = 4;
}

view.Textbox.prototype.toBack = function() {
	var textboxHTML = document.getElementById("textbox-html");
	textboxHTML.style.display = "none";

	var divTextbox = document.getElementById("textbox");
	divTextbox.style.zIndex = -3;
	this.clearTextbox();
}

//----------------------------------------------------------------------------
view.Textbox.prototype.draw = function() {
	var canvasWidth = paperTextbox.canvas.clientWidth ? paperTextbox.canvas.clientWidth : paperTextbox.width,
		canvasHeight = paperTextbox.canvas.clientHeight ? paperTextbox.canvas.clientHeight : paperTextbox.height;

	var areaRadius = 16;
	var canvasBorder = paperTextbox.path(getRoundedRectToPath(0, 0, (canvasWidth- 0), (canvasHeight - 0), areaRadius));
	canvasBorder.attr({fill: "#000", "fill-opacity": 0.5, stroke: "none", "stroke-width": 0, "stroke-opacity": 0});
	this.textbox.push(canvasBorder);

	canvasWidth = paperTextboxHTML.canvas.clientWidth ? paperTextboxHTML.canvas.clientWidth : paperTextboxHTML.width;
	canvasHeight = paperTextboxHTML.canvas.clientHeight ? paperTextboxHTML.canvas.clientHeight : paperTextboxHTML.height;
	var canvasCenterX = (canvasWidth / 2),
		canvasCenterY = (canvasHeight / 2);

	if (this.canvasBorder) {
		if (this.canvasBorder[0]) this.canvasBorder.remove();
	}
	this.canvasBorder = paperTextboxHTML.path(getRoundedRectToPath(5, 5, (canvasWidth - 8), (canvasHeight - 8), areaRadius));
	this.canvasBorder.attr({fill: MENU_BACKGROUND_COLOUR, stroke: MENU_BORDER_COLOUR, "stroke-width": 5, "stroke-opacity": 1, opacity: 0.8});

	if (this.submitButton) {
		if (this.submitButton[0]) this.submitButton.remove();
	}
	this.submitButton = paperTextboxHTML.path(getRoundedRectToPath(500, 235, 120, 40, (areaRadius / 2)));
	this.submitButton.attr({fill: BUTTON_BACKGROUND_COLOUR, stroke: BUTTON_BORDER_COLOUR, "stroke-width": 5, "stroke-opacity": 1, opacity: 0.5});

	this.submitButton.data("this",this);
	this.submitButton.hover(
		function() {
			if (this.animate) {
				if (!this.removed) this.animate({"opacity": 0.9}, 500);
			}
		},
		function() {
			if (this.animate) {
				if (!this.removed) this.animate({"opacity": 0.5}, 500);
			}
		}
	);

	this.submitButton.click(view.Textbox.prototype.done);
	//this.submitButtonText.click(onClick);

	var textboxHTML = document.getElementById("textbox-html");
	var textboxInnerHTML = document.getElementById("textbox-inner-html");
	if (!isEmpty(textboxHTML)) textboxHTML.style.display = "block";
	if (!isEmpty(textboxInnerHTML)) {
		textboxInnerHTML.style.display = "block";

		textboxInnerHTML.innerHTML = this.html;
	}

	//	draw the move symbol
	var symbol = paperTextboxHTML.path(this.movePaths[0]).attr({
		fill: "#4d96d5",
		stroke: "#4d96d5",
		opacity: 1,
		"stroke-opacity": 0
	});

	symbol.transform("t343,230");
}

//----------------------------------------------------------------------------
view.Textbox.prototype.setTextbox = function(type) {
	//Seperate "text" & "text-box"
	this.type = type;
};

view.Textbox.prototype.getTextbox = function() {
	//Seperate "text" & "text-box"
	return this.type;
};


//----------------------------------------------------------------------------
view.Textbox.prototype.close = function() {
	var path = getClosePath();

	var onClick = function() {
		window.textbox.toBack();
	}

	var iconJSON = {
		x:			180 - (DEFAULT_ICON_RADIUS * 2),
		y:			160 - (DEFAULT_ICON_RADIUS * 2),
		click:		onClick,
		path:		path,
		thisMain:	window,
		paper:		paperTextbox
	}

	var close = new sf.ifs.View.Icon(iconJSON);
	close.draw();

	this.textbox.push(close.getIcon());
}

//----------------------------------------------------------------------------
view.Textbox.prototype.push = function(object) {
	if (!isEmpty(this.textbox)) {
		this.textbox.push(object);
	}
};
