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

view.Undo = function(json) {
	this.json = json;
	this.undo = this.json.paper.set();
}

view.Undo.prototype.draw = function() {
	var margin = (this.json.orgsize[0] / 16);

	var x = (this.json.orgpos[0] + (this.json.orgsize[0] / 2)) - (margin * 2),
		y = this.json.orgpos[1] + (this.json.orgsize[1] / 2) + this.json.offset;
		
	var undoPath = this.json.paper.path(getUndoIcon(x, y, this.json.undoScale));
	try {
		var undoValid = thisMain.board.whiteboard.paint.objects.undoValid();
		if (undoValid) {
			undoPath.attr({
				"title": "Undo",
				"fill": "black",
				"stroke": "none"
			});	
		} else {
			undoPath.attr({
				"title": "Undo",
				"fill": "grey",
				"stroke": "none"
			});
		}
	} catch (e) {
		undoPath.attr({
			"title": "Undo",
			"fill": "grey",
			"stroke": "none"
		});
	}
	
	this.undo.push(undoPath);

	this.undo.hover(
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

view.Undo.prototype.update = function() {
	try {
		var undoValid = thisMain.board.whiteboard.paint.objects.undoValid();
		if (undoValid) {
			this.undo[0].attr({
				"title": "Undo",
				"fill": "black",
				"stroke": "none"
			});	
		} else {
			this.undo[0].attr({
				"title": "Undo",
				"fill": "grey",
				"stroke": "none"
			});
		}
	} catch (e) {
		this.undo[0].attr({
			"title": "Undo",
			"fill": "grey",
			"stroke": "none"
		});
	}
};
