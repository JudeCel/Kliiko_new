var view = namespace('sf.ifs.View');

/*
	format for the json
  	{
		orgpos:[x,y],		//Size of whiteboard before expansion
		orgsize:[x,y],		//Center postion of whiteboard before expansion
		pencilScale:int,	//Scale of pencil
		colour: string,
		choices:[[],[],[]]	//groups of choices of this icons
		offset:int,			//Offset from bottom of board body
		paper:paper
	}
*/

view.Redo = function(json) {
	this.json = json;
	this.redo = this.json.paper.set();
}

view.Redo.prototype.draw = function() {
	var margin = (this.json.orgsize[0] / 16);

	var x = (this.json.orgpos[0] + (this.json.orgsize[0] / 2)) - (margin * 1),
		y = this.json.orgpos[1] + (this.json.orgsize[1] / 2) + this.json.offset;
		
	var redoIconPath = getRedoIcon(x, y, this.json.redoScale);
		
	var redoPath = this.json.paper.path(redoIconPath);
	try {
		var redoValid = thisMain.board.whiteboard.paint.objects.redoValid();
		if (redoValid) {
			redoPath.attr({
				"title": "Undo",
				"fill": "black",
				"stroke": "none"
			});	
		} else {
			redoPath.attr({
				"title": "Undo",
				"fill": "grey",
				"stroke": "none"
			});
		}
	} catch (e) {
		redoPath.attr({
			"title": "Undo",
			"fill": "grey",
			"stroke": "none"
		});
	}
	
	this.redo.push(redoPath);

	this.redo.hover(
		//	hover in
		function() {
			if (this.animate) {
				var animationHoverIn = Raphael.animation({"opacity": 0.7}, 500);

				if (!this.removed) this.animate(animationHoverIn.delay(0));
			}
		},
		//	hover out
		function() {
			if (this.animate) {
				var animationHoverOut = Raphael.animation({"opacity": 1}, 500);
				if (!this.removed) this.animate(animationHoverOut.delay(0));
			}
		}
	);
	
};

view.Redo.prototype.update = function() {
	try {
		var redoValid = thisMain.board.whiteboard.paint.objects.redoValid();
		if (redoValid) {
			this.redo[0].attr({
				"title": "Undo",
				"fill": "black",
				"stroke": "none"
			});	
		} else {
			this.redo[0].attr({
				"title": "Undo",
				"fill": "grey",
				"stroke": "none"
			});
		}
	} catch (e) {
		this.redo[0].attr({
			"title": "Undo",
			"fill": "grey",
			"stroke": "none"
		});
	}
};
