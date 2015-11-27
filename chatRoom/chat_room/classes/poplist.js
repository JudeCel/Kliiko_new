var view = namespace('sf.ifs.View');

/*
	format for the json
	{
		expsize:[x,y]
		poplistScale:int,
		editableObjects:pointer
		paper:paper
	}
*/

view.Poplist = function (json) {
	this.json = json;

	this.poplist = this.json.paper.set();
	this.types = null;

	this.scale = 1.0;

	var userName = window.username;
	var participant = window.getParticipantByName(userName);
	
	this.role = participant.role;
}

view.Poplist.prototype.draw = function (icons, types) {
	var radius = 10;
	this.clearPoplist();

	if (this.types === types) {
		this.types = null;

		return;
	}
	
	this.types = types;
	
	var choices = new Array();

	this.icons = new Array();
	
	//	lets iterate though our choices and make sure we are allowed to use them
	for (var iconNdx = 0, ni = icons.length; iconNdx < ni; iconNdx++) {
		if (typeof icons[iconNdx].role != "undefined") {
			if (this.role === "facilitator") {
				choices.push(icons[iconNdx]);
			} else {
				if (this.role === icons[iconNdx].role) {
					choices.push(icons[iconNdx]);
				}
			}
		} else {
			choices.push(icons[iconNdx]);
		}
	}
	
	var width = choices.length * 50;
	var x = (1000 - width) / 2,
		y = 600,
		height = 45;

	this.poplist.push(paperWhiteboard.path(getRoundedRectToPath(x, y, width, height, radius)).attr({
		fill: "#cfcfcf",
		stroke: "#5c5c5c",
		"stroke-width": 2,
		"stroke-opacity": 0.5
	}));
	
	//	make sure our position is ready for the popup menu
	x = x + (radius / 2);
	y = (y + (radius / 2)) - 3;
	
	var offset = 0;
	for (var ndx = 0, nc = choices.length; ndx < nc; ndx++) {
		//	create a group for this icon
		cmd = "paths = getMenu" + choices[ndx].id + "PathAttr()";
		eval(cmd);	//	need to find a better way to do this
		
		var transformBG = "t" + (x + offset + 1) + "," + (y + 1),
			transformFG = "t" + (x + offset) + "," + y;

		switch(choices[ndx].id) {
			case 'Rotate':
			case 'Scale': {
				transformBG = transformBG + "s1.25, 1.25, 0, 0";
				transformFG = transformFG + "s1.25, 1.25, 0, 0";
			}
			break;
		}

		var iconBackground = paperWhiteboard.path(paths[0]).attr(paths[1]).transform(transformBG);
		var iconForground = paperWhiteboard.path(paths[0]).attr({stroke: COLOUR_HOVER_OUT, fill: COLOUR_HOVER_OUT}).attr(paths[2]).transform(transformFG);
		var iconArea = paperWhiteboard.path('M 0 0 L 40 0 L 40 40 L 0 40 Z').attr({'title': choices[ndx].title,'fill':'white','stroke':'none','stroke-width':'0','fill-opacity':'0','stroke-opacity':'0'}).transform("t" + (x + offset) + "," + y);
		offset = offset + 50;

		this.icons[choices[ndx].id] = iconForground;

		var icon = paperWhiteboard.set();
		iconArea.data("this", this);
		iconArea.data("id", choices[ndx].id);
		iconArea.data("icon", icon);
		iconArea.data("paths", paths);
		icon.push(iconBackground, iconForground, iconArea);

		iconArea.click(function() {
			if (window.whiteboardSetup === "corkboard") return;
			
			var me = this.data("this");
			var id = this.data("id");

			//var paint = me.poplist.parent.data("this");
			var paint = window.whiteboard.paint;

			if (!isEmpty(me.icons['1px'])) me.icons['1px'].attr({stroke: '#9f928b'});
			if (!isEmpty(me.icons['1px'])) me.icons['2px'].attr({stroke: '#9f928b'});
			if (!isEmpty(me.icons['1px'])) me.icons['4px'].attr({stroke: '#9f928b'});
			if (!isEmpty(me.icons['1px'])) me.icons['8px'].attr({stroke: '#9f928b'});
			if (!isEmpty(me.icons.Scribble)) me.icons.Scribble.attr({stroke: '#9f928b'});
			if (!isEmpty(me.icons.ScribbleFill)) me.icons.ScribbleFill.attr({fill: '#9f928b'});
			if (!isEmpty(me.icons.Line)) me.icons.Line.attr({stroke: '#9f928b'});
			if (!isEmpty(me.icons.Arrow)) me.icons.Arrow.attr({stroke: '#9f928b'});
			if (!isEmpty(me.icons.Text)) me.icons.Text.attr({stroke: '#9f928b'});
			if (!isEmpty(me.icons.TextBox)) me.icons.TextBox.attr({stroke: '#9f928b'});
			if (!isEmpty(me.icons.Rectangle)) me.icons.Rectangle.attr({stroke: '#9f928b'});
			if (!isEmpty(me.icons.RectangleFill)) me.icons.RectangleFill.attr({fill: '#9f928b'});
			if (!isEmpty(me.icons.Circle)) me.icons.Circle.attr({stroke: '#9f928b'});
			if (!isEmpty(me.icons.CircleFill)) me.icons.CircleFill.attr({fill: '#9f928b'});
			if (!isEmpty(me.icons.EraseOne)) me.icons.EraseOne.attr({fill: '#9f928b'});
			if (!isEmpty(me.icons.EraseAll)) me.icons.EraseAll.attr({fill: '#9f928b'});
			if (!isEmpty(me.icons.Move)) me.icons.Move.attr({fill: '#9f928b'});
			if (!isEmpty(me.icons.Rotate)) me.icons.Rotate.attr({fill: '#9f928b'});
			if (!isEmpty(me.icons.Scale)) me.icons.Scale.attr({fill: '#9f928b'});

			switch(id) {
				case '1px': {
					me.icons['1px'].attr({stroke: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrStrokeWidth(1);
				}
				break;
				case '2px': {
					me.icons['2px'].attr({stroke: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrStrokeWidth(2);
				}
				break;
				case '4px': {
					me.icons['4px'].attr({stroke: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrStrokeWidth(4);
				}
				break;
				case '8px': {
					me.icons['8px'].attr({stroke: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrStrokeWidth(8);
				}
				break;
				case 'Scribble': {
					me.icons.Scribble.attr({stroke: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrPencilShape("scribble");
				}
				break;
				case 'ScribbleFill': {
					me.icons.ScribbleFill.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrPencilShape("scribble-fill");
				}
				break;
				case 'Line': {
					me.icons.Line.attr({stroke: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrPencilShape("line");
				}
				break;
				case 'Arrow': {
					me.icons.Arrow.attr({stroke: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrPencilShape("arrow");
				}
				break;
				case 'Text': {
					me.icons.Text.attr({stroke: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					me.popTextbox("text");
				}
				break;
				case 'TextBox': {
					me.icons.TextBox.attr({stroke: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					me.popTextbox("text-box");
				}
				break;
				case 'Rectangle': {
					me.icons.Rectangle.attr({stroke: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrPencilShape("rectangle");
				}
				break;
				case 'Circle': {
					me.icons.Circle.attr({stroke: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrPencilShape("circle");
				}
				break;
				case 'RectangleFill': {
					me.icons.RectangleFill.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrPencilShape("rectangle-fill");
				}
				break;
				case 'CircleFill': {
					me.icons.CircleFill.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setAttrPencilShape("circle-fill");
				}
				break;
				case 'EraseOne': {
					me.icons.EraseOne.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setEraser();
				}
				break;
				case 'EraseAll': {
					window.dashboard.showMessage({
						message: {
							text: "Do you wish to erase everything\non the whiteboard?\n \n(this cannot be undone)",
							attr: {
								'font-size': 36,
								fill: "white"
							}
						},
						dismiss: {
							yes: {						//	check using window.dashboard.YES
								text:	"Yes",
								attr: {
									'font-size': 24,
									fill: "white"
								}
							},
							cancel: {						//	check using window.dashboard.NO
								text:	"Cancel",
								attr: {
									'font-size': 24,
									fill: "white"
								}
							}
						}
					}, function(value) {
						switch (value) {
							case window.dashboard.YES: {
								me.icons.EraseAll.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
								paint.setEraseAll();
							}
								break;
							case window.dashboard.CANCEL: {
							}
								break;
						}
						window.dashboard.toBack();	//	time to hide the dashboard
					});
				}
				break;
				case 'Move': {
					me.icons.Move.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setMove("move");
				}
				break;
				case 'Scale': {
					me.icons.Scale.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setMove("scale");
				}
				break;
				case 'Rotate': {
					me.icons.Rotate.attr({fill: WHITEBOARD_ICON_BACKGROUND_COLOUR});
					paint.setMove("rotate");
				}
				break;
			}
		});
		
		iconArea.hover(
			//	hover in
			function() {
				var icon = this.data("icon");
				if (icon[1].animate) {
					var paths = this.data("paths");
					var animationHoverIn = Raphael.animation(paths[3], 250);
					if (!icon[1].removed) icon[1].animate(animationHoverIn.delay(0));
				}
			},
			//	hover out
			function() {
				var icon = this.data("icon");
				if (icon[1].animate) {
					var paths = this.data("paths");
					var animationHoverOut = Raphael.animation(paths[2], 250);
					if (!icon[1].removed) icon[1].animate(animationHoverOut.delay(0));
				}
			}
		);
		
		this.poplist.push(icon);
	}
};

view.Poplist.prototype.clearPoplist = function () {
	var popItem = null;
	this.types = null;	//	this is used by other menus
						//	to determine if the poplist
						//	should be cleared or not
	
	if (isEmpty(this.poplist)) return;
	
	while (this.poplist.length > 0) {
		popItem = this.poplist.pop();
		popItem.remove();	//	popList is a Raphael set, popItem is the top-most object
	}
};

view.Poplist.prototype.setParents = function (paint) {
	this.poplist.parent = paint;
};

view.Poplist.prototype.popTextbox = function(type) {
	if (isEmpty(window.textbox)) window.textbox = new sf.ifs.View.Textbox();
	window.textbox.setTextbox(type);
	window.textbox.draw();
	window.textbox.toFront();
	window.textbox.close();
};

view.Poplist.prototype.getThis = function() {
	return this;
};

view.Poplist.prototype.undoValid = function() {
	return this.json.objects.undoValid();
}

view.Poplist.prototype.redoValid = function() {
	return this.json.objects.redoValid();
}

