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

view.Gear = function(json) {
	this.json=json;
	this.gear=this.json.paper.set();
}
view.Gear.prototype.draw=function(){
	var gearPaths=this.getGearPaths();

	this.gear.push(
		this.json.paper.path(gearPaths[0]).attr({fill:"#787554","stroke":"#535353","stroke-opacity":.3}),
		this.json.paper.path(gearPaths[1]).attr({fill:"#5c5a40","stroke":"#535353","stroke-opacity":.3}),
		this.json.paper.path(gearPaths[2]).attr({fill:"#a49e53","stroke":"#535353","stroke-opacity":.3})
	);

	this.gear.data("this",this);
	this.gear.click(this.onGearClickFun);
	this.gear.hover(this.onGearHoverIn,this.onGearHoverOut);
	
	this.gear.attr({title: "Line Width"});
};
//Get paths to draw pencil
view.Gear.prototype.getGearPaths=function(){
	var paths=new Array();
	
	var gearXY=new Array();

	var margin = (this.json.orgsize[0] / 16); 

	gearXY.push(
		(this.json.orgpos[0] - (this.json.orgsize[0] / 2)) + (margin * 6),
		this.json.orgpos[1] + (this.json.orgsize[1] / 2) + this.json.offset
		//this.json.orgpos[0] + (this.json.orgsize[0] / 2) - this.json.gearScale,
		//this.json.orgpos[1] + (this.json.orgsize[1] / 2) + this.json.offset
	);

	paths.push(
		getGearLightShade(gearXY[0],gearXY[1],this.json.gearScale),
		getGearDarkShade(gearXY[0],gearXY[1],this.json.gearScale),		
		getGearFront(gearXY[0],gearXY[1],this.json.gearScale)
			
	);
	
	return paths;
};
//Set board as parent of eraser
view.Gear.prototype.setParents=function(board){
	this.gear.parent=board;
};

view.Gear.prototype.onGearClickFun=function(event,x,y){
	var me=this.data("this");
	var paint=me.gear.parent.paint;
	paint.drawPoplist(x,me.json.choices,me.json.types);
};
view.Gear.prototype.onGearHoverIn=function(){
	var me=this.data("this");
	me.gear.attr({"opacity":0.7});
};
view.Gear.prototype.onGearHoverOut=function(){
	var me=this.data("this");
	me.gear.attr({"opacity":1});
};