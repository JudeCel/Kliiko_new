var view = namespace('sf.ifs.View');

/*
	format for the json
  	{
		orgpos:[x,y],		//Size of whiteboard before expansion
		orgsize:[x,y],		//Center postion of whiteboard before expansion
		eraserScale:int,	//Scale of eraser
		offset:int,			//Offset from bottom of board body
		paper:paper
	}
*/

view.Eraser = function(json) {
	this.json=json;
	this.eraser=this.json.paper.set();
}

view.Eraser.prototype.draw=function(){
	var eraserPaths=this.getEraserPaths();

	this.eraser.push(
		this.json.paper.path(eraserPaths[0]).attr({fill:"#4d4d4d","stroke":"none"}),
		this.json.paper.path(eraserPaths[1]).attr({fill:"#353535","stroke":"none"}),
		this.json.paper.path(eraserPaths[2]).attr({fill:"#5b5b5b","stroke":"#5b5b5b"}),
		this.json.paper.path(eraserPaths[3]).attr({fill:"#4e4e4e","stroke":"none"})
	);
	
	this.eraser.attr({title: "Eraser"});
	
	this.eraser.data("this",this);
	
	//********************************
	this.eraser.click(this.onEraserClick);
	
	this.eraser.hover(this.onEraserHoverIn,this.onEraserHoverOut);
}

//Get paths to draw eraser
view.Eraser.prototype.getEraserPaths = function() {
	var paths = new Array();
	
	var eraserXY = new Array();

	var margin = (this.json.orgsize[0] / 16); 

	eraserXY.push(
		(this.json.orgpos[0] + (this.json.orgsize[0] / 2)) - (margin * 5),
		this.json.orgpos[1] + (this.json.orgsize[1] / 2) + this.json.offset
	);

	paths.push(
		getEraserRightSide(eraserXY[0],eraserXY[1],this.json.eraserScale/3),
		getEraserTop(eraserXY[0],eraserXY[1],this.json.eraserScale/3),
		getEraserFrontSide(eraserXY[0],eraserXY[1],this.json.eraserScale/3),
		getEraserBottom(eraserXY[0],eraserXY[1],this.json.eraserScale/3)
	);
	
	return paths;
}
//Set board as parent of eraser
view.Eraser.prototype.setParents = function(board){
	this.eraser.parent=board;
}
view.Eraser.prototype.onEraserHoverIn = function(){
	var me=this.data("this");
	me.eraser.attr({"opacity":0.7});
}
view.Eraser.prototype.onEraserHoverOut=function(){
	var me=this.data("this");
	me.eraser.attr({"opacity": 1});
}
view.Eraser.prototype.onEraserClick=function(event,x,y){
	var me=this.data("this");
	var paint=me.eraser.parent.paint;
	paint.drawPoplist(x,me.json.choices,me.json.types);
}