var view = namespace('sf.ifs.View');
/*
	format for the json
	{
		x: int,							//	left position of the canvas controller
		y: int,							//	top position of the canvas controller
		width: int,						//	used to determine the width of the controller
		height: int,					//	used to determine the height of the controller
		attr: json,						//	uses the same structure as raphaeljs
		thisMain: pointer				//	pointer to the "this" structure in topic.html
	}
*/

view.Canvas = function(json) {
	this.json = extend(json);	//	make a copy of this canvas

	this.canvas = Raphael(json.x, json.y, json.width, json.height);
	this.currentPath = null;
	
	this.frame = this.canvas.rect(0, 0, json.width, json.height);
	
	this.frame.attr({fill: "#000", opacity: 0.0});

	// Sets the stroke attribute of the circle to white
	//frame.attr("stroke", "#00f");
	var frameStart = function(x, y, event) { 
		var me = this.data("this");
		x = x - me.json.x;
		y = y - me.json.y;
		me.base = me.old;
		me.old = {
			x: x,
			y: y
		};
		me.path = "M" + x + "," + y;
	}, 

	frameMove = function(dx, dy, x, y, event) { 
		var me = this.data("this");
		x = x - me.json.x;
		y = y - me.json.y;

		me.path = me.path + "L" + x + "," + y;
		if (this.currentPath != null) {
			if (this.currentPath[0] != null) {
				this.currentPath.remove();
			}
		}
		
		this.currentPath = me.canvas.path(me.path).attr(me.json.attr);
		//this.currentPath = me.canvas.path("M0,0L100,100").attr({stroke: "#000", "stroke-width": 1});
	}, 

	frameUp = function(event) { 
		var me = this.data("this");
		
		var percentage = ((me.cx + 1) / (me.json.width - sliderThumbWidth)) * 100;
		//console.log(me.path);
		
		jsonMessage = {
			type: 'sendobject',
			message: {
				path: me.path,
				attr: me.json.attr
			}
		}
		me.json.thisMain.sendMessage(jsonMessage);
	}; 
	
	this.old = {
		x: 0,
		y: 0
	};
					//	set the original value for this
	this.current = {
		x: 0,
		y: 0
	};
	
	this.frame.data("this", this);	//	allow us to see the "this" inside the drag events
	
	this.frame.drag(frameMove, frameStart, frameUp);
};

view.Canvas.prototype.dealloc = function() {
	//var canvasDom = this.canvas.canvas;
	//canvasDom.parentNode.removeChild(canvasDom);
	//this.canvas = null;
	
	//this.canvas.clear();
	//this.canvas.remove();
}

view.Canvas.prototype.getPaper = function() {
	return this.canvas;
}

view.Canvas.prototype.updateCanvas = function(name, data) {
	//console.log("Canvas [updateCanvas] Name: " + name + ", Path: " + data.path + ", Attr: " + data.attr);
	this.canvas.path(data.path).attr(data.attr);
};

view.Canvas.prototype.updateAttr = function(key, value) {
	this.json.attr[key] = value;
}

