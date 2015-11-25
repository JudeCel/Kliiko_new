var view = namespace('sf.ifs.View');

/*
	json = {
		orgsize:[x,y],					//size of whiteboard before expansion
		expsize:[x,y],					//size of whiteboard after expansion
		orgpos:[x,y],					//Center postion of whiteboard before expansion
		exppos:[x,y],					//Center position of whiteboard after expansion
		thisMain: pointer,				//	pointer to the "this" structure in topic.html
		paper: pointer,					//	pointer to the canvas we are drawing on (get dimensions from this too)
		paperCanvas: pointer			//	pointer to the canvas we are drawing on (get dimensions from this too)
	}
*/

view.Board = function (json) {
	this.json = json;
	this.checkValidation();

	var adjexpsize = new Array();
	adjexpsize.push(
	this.json.expsize[0] - 50, this.json.expsize[1] - 50);
	var whiteboardJson = {
		orgsize: this.json.orgsize,
		expsize: adjexpsize,
		orgpos: this.json.orgpos,
		exppos: this.json.exppos,
		shade: 2,
		//	width of shade, used for decoration of whiteboard
		holderscale: 1,
		//	scale of pencil and eraser holder at bottom of whiteboard
		thisMain: this.json.thisMain,
		paper: this.json.paper,
		paperCanvas: this.json.paperCanvas
	};

	this.whiteboard = new sf.ifs.View.Whiteboard(whiteboardJson);
	this.whiteboard.draw();
}

view.Board.prototype.checkValidation = function () {
	//CHECK VALIDATION OF ORGSIZE, WILL DO DIVIDE IN FUTURE
	if (this.json.orgsize[0] === 0) this.json.orgsize[0] = 1;
	if (this.json.orgsize[1] === 0) this.json.orgsize[1] = 1;
	if (this.json.expsize[0] === 0) this.json.expsize[0] = 1;
	if (this.json.expsize[1] === 0) this.json.expsize[1] = 1;

	//CHECK VALIDATION OF WHITE BOARD SIZE
	var width = this.json.paper.canvas.clientWidth ? this.json.paper.canvas.clientWidth : this.json.paper.width;
	var height = this.json.paper.canvas.clientHeight ? this.json.paper.canvas.clientHeight : this.json.paper.height;
	if (this.json.expsize[0] > width) this.json.expsize[0] = width;
	if (this.json.expsize[1] > height) this.json.expsize[1] = height;
}

view.Board.prototype.updateCanvas = function (name, data) {
	this.whiteboard.updateCanvas(name, data);
};
view.Board.prototype.updateEvent = function (topicid, data) {
	this.whiteboard.updateEvent(topicid, data);
};
view.Board.prototype.updateUndo = function (eventid, username, topicid, data) {
	this.whiteboard.updateUndo(eventid, username, topicid, data);
};
view.Board.prototype.updateRedo = function (eventid, username, topicid, data) {
	this.whiteboard.updateRedo(eventid, username, topicid, data);
};