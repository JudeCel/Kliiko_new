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

view.Pencil = function(json) {
	this.json=json;
	this.pencil=this.json.paper.set();
}
view.Pencil.prototype.draw=function(){
	var pencilPaths=this.getPencilPaths();
	
	var colourMain = this.json.colour;
	var colourDarker = hexToColour(colourMain);
	colourDarker = takeFromColour(colourDarker, parseInt('220808', 16));
	colourDarker = colourToHex(colourDarker);

	this.pencil.push(
		this.json.paper.path(pencilPaths[0]).attr({fill: colourMain,"stroke":"#535353","stroke-opacity":.3}),
		this.json.paper.path(pencilPaths[1]).attr({fill: colourDarker,"stroke":"none"}),
		this.json.paper.path(pencilPaths[2]).attr({fill: "#fafafa","stroke":"#535353","stroke-opacity":.3}),
		this.json.paper.path(pencilPaths[3]).attr({fill: "#cfcfcf","stroke":"none"}),
		this.json.paper.path(pencilPaths[4]).attr({fill: colourMain,"stroke":"none"})
	);
	
	this.pencil.data("this",this);
	this.pencil.click(this.onPencilClickFun);
	this.pencil.hover(this.onPencilHoverIn,this.onPencilHoverOut);

	this.pencil.attr({title: "Write & Draw"});
}
//Get paths to draw pencil
view.Pencil.prototype.getPencilPaths=function(){
	var paths=new Array();
	
	var pencilXY=new Array();

	var margin = (this.json.orgsize[0] / 16); 

	pencilXY.push(
		(this.json.orgpos[0] - (this.json.orgsize[0] / 2)) + (margin * 1),
		this.json.orgpos[1] + (this.json.orgsize[1] / 2) + this.json.offset
		//this.json.orgpos[0] - (this.json.orgsize[0] / 4) - (this.json.pencilScale / 2),
		//this.json.orgpos[1] + (this.json.orgsize[1] / 2) + this.json.offset
	);

	paths.push(
		getPencilHead(pencilXY[0],pencilXY[1],this.json.pencilScale/5),
		getPencilHeadDecor(pencilXY[0],pencilXY[1],this.json.pencilScale/5),
		getPencilBody(pencilXY[0]+this.json.pencilScale/5,pencilXY[1],this.json.pencilScale/5),
		getPencilBodyShade(pencilXY[0]+this.json.pencilScale/5,pencilXY[1],this.json.pencilScale/5),
		getPencilDecor(pencilXY[0]+this.json.pencilScale/5,pencilXY[1],this.json.pencilScale/5)
	);
	
	return paths;
}
//Set board as parent of eraser
view.Pencil.prototype.setParents=function(board){
	this.pencil.parent=board;
}

view.Pencil.prototype.onPencilClickFun=function(event,x,y){
	var me=this.data("this");
	var paint=me.pencil.parent.paint;
	paint.drawPoplist(x,me.json.choices,me.json.types);
}
view.Pencil.prototype.onPencilHoverIn=function(){
	var me=this.data("this");
	me.pencil.attr({"opacity":0.7});
}
view.Pencil.prototype.onPencilHoverOut=function(){
	var me=this.data("this");
	me.pencil.attr({"opacity":1});
}