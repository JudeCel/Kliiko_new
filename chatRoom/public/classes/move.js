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

view.Move = function(json) {
	this.json = json;
	this.move = this.json.paper.set();
}

view.Move.prototype.draw = function() {
	var margin = (this.json.orgsize[0] / 16);

	var x = (this.json.orgpos[0] + (this.json.orgsize[0] / 2)) - (margin * 3),
		y = this.json.orgpos[1] + (this.json.orgsize[1] / 2) + this.json.offset;
		
	var movePath = this.json.paper.path(getMoveIcon(x, y, this.json.moveScale)).attr({
		"title": "Move",
		"fill": "black",
		"stroke": "none"
	});
	
	this.move.push(movePath);

	this.move.hover(
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
