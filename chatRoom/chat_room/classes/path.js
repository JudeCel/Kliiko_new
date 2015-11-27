//GET BOARD ROUNDED SHAPE
function getRoundedRectToPath(x, y, w, h, r) {
	var result      = "M" + x + "," + (y + r);
	result = result + "A" + r + "," + r + " 0 0,1 " + (x + r) + "," + y;
	result = result + "L" + (x + w - r) + "," + y;
	result = result + "A" + r + "," + r + " 0 0,1 " + (x + w) + "," + (y + r);
	result = result + "L" + (x + w) + "," + (y + h - r);
	result = result + "A" + r + "," + r + " 0 0,1 " + (x + w - r) + "," + (y + h);
	result = result + "L" + (x + r) + "," + (y + h);
	result = result + "A" + r + "," + r + " 0 0,1 " + x + "," + (y + h - r);
	result = result + "Z";

	return result;
};

//GET REFLECTION ON BOARD
function getBoardReflect(){
	
}

//      ---
//   r |  |
//  ---   ---
// |   w*h    |
// ---   ---
//   |  |
//   ---
//GET EDGE DECORATION OF WHITEBOARD
function getEdgeDecor(cx,cy,w,h,r){
	var result="M"+(cx-w/2+r)+" "+(cy-h/2-r)+",";
	result=result+"L"+(cx+w/2-r)+" "+(cy-h/2-r)+",";
	result=result+"L"+(cx+w/2-r)+" "+(cy-h/2+r)+",";
	result=result+"L"+(cx+w/2+r)+" "+(cy-h/2+r)+",";
	result=result+"L"+(cx+w/2+r)+" "+(cy+h/2-r)+",";
	result=result+"L"+(cx+w/2-r)+" "+(cy+h/2-r)+",";
	result=result+"L"+(cx+w/2-r)+" "+(cy+h/2+r)+",";
	result=result+"L"+(cx-w/2+r)+" "+(cy+h/2+r)+",";
	result=result+"L"+(cx-w/2+r)+" "+(cy+h/2-r)+",";
	result=result+"L"+(cx-w/2-r)+" "+(cy+h/2-r)+",";
	result=result+"L"+(cx-w/2-r)+" "+(cy-h/2+r)+",";
	result=result+"L"+(cx-w/2+r)+" "+(cy-h/2+r)+",";
	result=result+"Z";
	
	return result;
};

//GET REFLECTION OF TOP & BOTTOM DECORATION
function getTopBottomReflect(cx,cy,w,h,r){
	var result="M"+(cx+w/4)+" "+(cy-h/2-r)+",";
	result=result+"S"+(cx+w/4-r)+" "+(cy-h/2-r)+" "+(cx+w/4-r)+" "+(cy-h/2)+",";
	result=result+"L"+(cx-w/4+r)+" "+(cy+h/2)+",";
	result=result+"S"+(cx-w/4)+" "+(cy+h/2)+" "+(cx-w/4)+" "+(cy+h/2+r)+",";
	result=result+"L"+(cx+w/2-r)+" "+(cy+h/2+r)+",";
	result=result+"L"+(cx+w/2-r)+" "+(cy-h/2-r)+",";
	result=result+"Z";
	
	return result;
};

//GET PATTERN OF RIGHT & LEFT DECORATION
function getRightLeftReflect(cx,cy,w,h,r,e){
	var gap=e/3;
	var result="M"+(cx-w/2-r+gap)+" "+(cy-h/2+r+gap)+",";
	result=result+"L"+(cx-w/2-r+gap)+" "+(cy+h/2-r-gap)+",";
	result=result+"M"+(cx-w/2-r+gap*2)+" "+(cy-h/2+r+gap)+",";
	result=result+"L"+(cx-w/2-r+gap*2)+" "+(cy+h/2-r-gap)+",";
	result=result+"M"+(cx+w/2+r-gap*2)+" "+(cy-h/2+r+gap)+",";
	result=result+"L"+(cx+w/2+r-gap*2)+" "+(cy+h/2-r-gap)+",";
	result=result+"M"+(cx+w/2+r-gap)+" "+(cy-h/2+r+gap)+",";
	result=result+"L"+(cx+w/2+r-gap)+" "+(cy+h/2-r-gap);
	
	return result;
};

//GET PENCIL HOLDER
function getPencilHolder(cx,cy,w,h,r,s){
	var holderw=r*s;
	var result="M"+(cx-w/2+r)+" "+(cy+h/2+r)+",";
	result=result+"L"+(cx-w/2)+" "+(cy+h/2+r+holderw)+",";
	result=result+"L"+(cx+w/2)+" "+(cy+h/2+r+holderw)+",";
	result=result+"L"+(cx+w/2-r)+" "+(cy+h/2+r)+",";
	result=result+"Z";
	
	return result;
};
//GET PENCIL HOLDER CONNECTOR
function getPencilHolderConnnector(cx,cy,w,h,r,s){
	var holderw=r*s;
	var result="M"+(cx-w/2+r)+" "+(cy+h/2+r)+",";
	result=result+"L"+(cx-w/2)+" "+(cy+h/2+r+holderw)+",";
	result=result+"L"+(cx-w/2+r)+" "+(cy+h/2+r+2)+",";
	result=result+"L"+(cx+w/2-r)+" "+(cy+h/2+r+2)+",";
	result=result+"L"+(cx+w/2)+" "+(cy+h/2+r+holderw)+",";
	result=result+"L"+(cx+w/2-r)+" "+(cy+h/2+r)+",";
	result=result+"Z";
	
	return result;
};
//GET PENCIL SHADE, A RETANGLE PATH
function getPencilHolderShade(x,y,w,h){
	var result="M"+x+" "+y+",";
	result=result+"L"+(x+w)+" "+y+",";
	result=result+"L"+(x+w)+" "+(y+h)+",";
	result=result+"L"+x+" "+(y+h)+",";
	result=result+"Z";
	
	return result;
}
//GET PENCIL HEAD, PART OF PENCIL
function getPencilHead(x,y,s){
	var result="M"+(x+s)+" "+y+",";
	result=result+"L"+(x+s/3)+" "+y+",";
	result=result+"L"+(x+s/3)+" "+(y+s/6)+",";
	result=result+"S"+(x-s/3)+" "+(y+s/2)+" "+(x+s/3)+" "+(y+s*5/6)+",";
	result=result+"L"+(x+s/3)+" "+(y+s)+",";
	result=result+"L"+(x+s)+" "+(y+s)+",";
	result=result+"Z";
	
	return result;
}
//GET PENCIL HEAD DECORATION
function getPencilHeadDecor(x,y,s){
	var result="M"+(x+s/3)+" "+y+",";
	result=result+"L"+(x+s/3)+" "+(y+s/6)+",";
	result=result+"S"+(x-s/3)+" "+(y+s/2)+" "+(x+s/3)+" "+(y+s*5/6)+",";
	result=result+"L"+(x+s/3)+" "+(y+s)+",";
	result=result+"L"+(x+s*5/6)+" "+(y+s)+",";
	result=result+"S"+(x+s*2/3)+" "+(y+s/2)+" "+(x+s/2)+" "+y;
	result=result+"Z";
	
	return result;
}
//GET PENCIL BODY, PART OF PENCIL
function getPencilBody(x,y,s){
	var result="M"+x+" "+y+",";
	result=result+"L"+(x+s*4)+" "+y+",";
	result=result+"S"+(x+s*4.5)+" "+(y+s/2)+" "+(x+s*4)+" "+(y+s)+",";
	result=result+"L"+x+" "+(y+s)+",";
	result=result+"Z";
	
	return result;
}
//GET PENCIL BODY SHADE, PART OF PENCIL
function getPencilBodyShade(x,y,s){
	var result="M"+x+" "+y+",";
	result=result+"S"+(x+s*2)+" "+(y+s)+" "+(x+s*4)+" "+(y+s)+",";
	result=result+"L"+x+" "+(y+s)+",";
	result=result+"Z";
	
	return result;
}
//GET PENCIL BODY DECOR, PART OF PENCIL
function getPencilDecor(x,y,s){
	var result="M"+(x+s*4/3)+" "+y+",";
	result=result+"S"+(x+s/2)+" "+y+" "+x+" "+(y+s)+",";
	result=result+"L"+(x+s/2)+" "+(y+s)+",";
	result=result+"S"+(x+s*4/3)+" "+y+" "+(x+s*3)+" "+y+",";
	result=result+"Z";
	
	return result;
}
//GET ERASER TOP, PART OF ERASER
function getEraserTop(x,y,s){
	var result="M"+(x-s*2)+" "+y+",";
	result=result+"S"+(x-s/3*7)+" "+y+" "+(x-s/3*8)+" "+(y+s/3)+",";
	result=result+"L"+(x-s*2/3)+" "+(y+s/3)+",";
	result=result+"S"+(x-s/3)+" "+y+" "+x+" "+y+",";
	result=result+"Z";
	
	return result;
}
//GET ERASER RIGHT SIDE, PART OF ERASER
function getEraserRightSide(x,y,s){
	var result="M"+x+" "+y+",";
	result=result+"S"+(x-s/3)+" "+y+" "+(x-s*2/3)+" "+(y+s/3)+",";
	result=result+"L"+(x-s*2/3)+" "+(y+s*5/6)+",";
	result=result+"L"+(x-s*7/9)+" "+(y+s)+",";
	result=result+"S"+(x-s/2)+" "+(y+s)+" "+(x+s/6)+" "+(y+s/3)+",";
	result=result+"L"+x+" "+(y+s/2)+",";
	result=result+"Z";
		
	return result;
}
//GET ERASER FRONT SIDE,PART OF ERASER
function getEraserFrontSide(x,y,s){
	var result="M"+(x-s*2/3)+" "+(y+s/3)+",";
	result=result+"L"+(x-s/3*8)+" "+(y+s/3)+",";
	result=result+"L"+(x-s/3*8)+" "+(y+s*5/6)+",";
	result=result+"L"+(x-s*2/3)+" "+(y+s*5/6)+",";
	result=result+"Z";
	
	return result;
}
//GET ERASER BOTTOM, PART OF ERASER
function getEraserBottom(x,y,s){
	var result="M"+(x-s*2/3)+" "+(y+s*5/6)+",";
	result=result+"L"+(x-s/3*8)+" "+(y+s*5/6)+",";
	result=result+"L"+(x-s/9*25)+" "+(y+s)+",";
	result=result+"L"+(x-s*7/9)+" "+(y+s)+",";
	result=result+"Z";
	
	return result;
}
//GET SHAPE FRONT,PART OF SHAPE ICON
function getShapesFront(x,y,s){
	var result="M"+x+" "+y+",";
	result=result+"L"+(x-s/2)+" "+(y-s*2)+",";
	result=result+"L"+(x-s*3/2)+" "+(y-s/4)+",";
	result=result+"Z";

	return result;
}
//GET SHAPE SIDE, PART OF SHAPE ICON
function getShapesSide(x,y,s){
	var result="M"+x+" "+y+",";
	result=result+"L"+(x-s/2)+" "+(y-s*2)+",";
	result=result+"L"+(x+s/2)+" "+(y-s/4)+",";
	result=result+"Z";

	return result;
}
//GET POPLIST PATH
function getPoplistPath(x,y,l,s){
	var r=s/4;
	var result="M"+x+" "+y+",";
	result=result+"L"+(x+r/2)+" "+(y-r)+",";
	result=result+"L"+(x+r)+" "+(y-r)+",";
	result=result+"A"+r+" "+r+" 0 0 0 "+(x+2*r)+" "+(y-2*r)+",";
	result=result+"L"+(x+r*2)+" "+(y-s*l)+",";
	result=result+"A"+r+" "+r+" 0 0 0 "+(x+r)+" "+(y-r-s*l)+",";
	result=result+"L"+(x-r)+" "+(y-r-s*l)+",";
	result=result+"A"+r+" "+r+" 0 0 0 "+(x-2*r)+" "+(y-s*l)+",";
	result=result+"L"+(x-2*r)+" "+(y-2*r)+",";
	result=result+"A"+r+" "+r+" 0 0 0 "+(x-r)+" "+(y-r)+",";
	result=result+"L"+(x-r/2)+" "+(y-r)+",";
	result=result+"Z";

	return result;
}
//GET SEPERATION LINES IN POPLIST
function getPoplistSepLine(x,y,s){
	var result="M"+(x-s/2)+" "+y+",";
	result=result+"L"+(x+s/2)+" "+y;
	
	return result;
}
//GET ICON FOR DEFAULT LINE
function getDefaultIcon(x,y,s){
	var result="M"+(x-s/2)+" "+y+",";
	result=result+"S"+(x-s/4)+" "+(y-s/2)+" "+x+" "+y+",";
	result=result+"S"+(x+s/4)+" "+(y+s/2)+" "+(x+s/2)+" "+y+",";
	
	return result;
}
//GET FILLED ICON FOR SCRIBBLE FILL
function getScribbleFillIcon(x,y,s){
	var result="M"+(x-s/2)+" "+(y+s/2)+",";
	result=result+"C"+(x-s/2)+" "+(y-s/4)+" "+x+" "+y+" "+(x+s/2)+" "+(y+s/2)+",";
	result=result+"Z";
	
	return result;
}
//GET UNDO ICON
function getUndoIcon(x,y,s){
	var result="M"+(x+s/4)+" "+(y+s/2)+",";
	result=result+"S"+(x+s*2/3)+" "+(y+s/4)+" "+(x-s/4)+" "+(y-s/4)+",";
	result=result+"L"+(x-s/4)+" "+(y-s/2)+",";
	result=result+"L"+(x-s/2)+" "+(y-s/4)+",";
	result=result+"L"+(x-s/4)+" "+(y+s/4)+",";
	result=result+"L"+(x-s/4)+" "+y+",";
	result=result+"S"+(x+s/2)+" "+(y+s/4)+" "+(x+s/4)+" "+(y+s/2);
	
	return result;
}
//GET REDO ICON
function getRedoIcon(x,y,s){
	var result="M"+(x-s/4)+" "+(y+s/2)+",";
	result=result+"S"+(x-s*2/3)+" "+(y+s/4)+" "+(x+s/4)+" "+(y-s/4)+",";
	result=result+"L"+(x+s/4)+" "+(y-s/2)+",";
	result=result+"L"+(x+s/2)+" "+(y-s/4)+",";
	result=result+"L"+(x+s/4)+" "+(y+s/4)+",";
	result=result+"L"+(x+s/4)+" "+y+",";
	result=result+"S"+(x-s/2)+" "+(y+s/4)+" "+(x-s/4)+" "+(y+s/2);
	
	return result;
}
//GET ICON FOR STRAIGHT LINE
function getLineIcon(x,y,s){
	var result="M"+(x-s/2)+" "+(y+s/2)+",";
	result=result+"L"+(x+s/2)+" "+(y-s/2);
	
	return result;
}
//GET ICON FOR ARROW,ALSO PATH FOR ARROW DRAWING IN WHITEBOARD
function getArrowPath(x1,y1,x2,y2,a){
	var angle=Math.atan((y2-y1)/(x2-x1));
	var result="M"+x1+" "+y1+",";
	result=result+"L"+x2+" "+y2+",";

	if (x2>x1){ 
		result=result+"L"+(x2-Math.cos(angle-Math.PI/6)*a)+" "+(y2-Math.sin(angle-Math.PI/6)*a)+",";
		result=result+"M"+x2+" "+y2+",";	
		result=result+"L"+(x2-Math.sin(Math.PI/3-angle)*a)+" "+(y2-Math.cos(Math.PI/3-angle)*a);
	}else{
		result=result+"L"+(x2+Math.cos(angle-Math.PI/6)*a)+" "+(y2+Math.sin(angle-Math.PI/6)*a)+",";
		result=result+"M"+x2+" "+y2+",";	
		result=result+"L"+(x2+Math.sin(Math.PI/3-angle)*a)+" "+(y2+Math.cos(Math.PI/3-angle)*a);
	}
	
	return result;
}
//GET FRONT PART OF GEAR, PART OF GEAR
function getGearFront(x,y,s){
	var angle=(Math.PI/2+Math.PI/12);
	var result=getCircleToPath(x,y,s/6)+",";
	result=result+"M"+(x+Math.cos(angle)*s/2)+" "+(y+Math.sin(angle)*s/2)+",";
	for(var i=0;i<6;i++){
		angle=angle-Math.PI/6;
		result=result+"L"+(x+Math.cos(angle)*s/2)+" "+(y+Math.sin(angle)*s/2)+",";
		result=result+"L"+(x+Math.cos(angle)*s/3)+" "+(y+Math.sin(angle)*s/3)+",";
		angle=angle-Math.PI/6;
		result=result+"S"+(x+Math.cos(angle+Math.PI/12)*s/3)+" "+(y+Math.sin(angle+Math.PI/12)*s/3)+" "+(x+Math.cos(angle)*s/3)+" "+(y+Math.sin(angle)*s/3)+",";
		result=result+"L"+(x+Math.cos(angle)*s/2)+" "+(y+Math.sin(angle)*s/2)+",";
	}
	return result;
}
//GET LIGHT SHADE OF GEAR, PART OF GEAR
function getGearLightShade(x,y,s){
	var result="M"+(x+Math.cos(Math.PI/12)*s/2)+" "+(y-Math.sin(Math.PI/12)*s/2)+",L"+(x+Math.cos(Math.PI/12)*s/2)+" "+(y-Math.sin(Math.PI/12)*s/2+s/12)+",L"+(x+Math.cos(Math.PI/12)*s/3)+" "+(y-Math.sin(Math.PI/12)*s/3+s/12)+",L"+(x+Math.cos(Math.PI/12)*s/3)+" "+(y-Math.sin(Math.PI/12)*s/3)+"Z,";
	
	result=result+"M"+(x+Math.cos(-Math.PI/12)*s/2)+" "+(y-Math.sin(-Math.PI/12)*s/2)+",L"+(x+Math.cos(-Math.PI/12)*s/2)+" "+(y-Math.sin(-Math.PI/12)*s/2+s/12)+",L"+(x+Math.cos(-Math.PI/4)*s/2)+" "+(y-Math.sin(-Math.PI/4)*s/2+s/12)+",L"+(x+Math.cos(-Math.PI/4)*s/2)+" "+(y-Math.sin(-Math.PI/4)*s/2)+"Z,";
	
	result=result+"M"+(x+Math.cos(-Math.PI*5/12)*s/3)+" "+(y-Math.sin(-Math.PI*5/12)*s/3)+",L"+(x+Math.cos(-Math.PI*5/12)*s/3)+" "+(y-Math.sin(-Math.PI*5/12)*s/3+s/12)+",S"+(x+Math.cos(-Math.PI/3)*s/3)+" "+(y-Math.sin(-Math.PI/3)*s/3+s/12)+" "+(x+Math.cos(-Math.PI/4)*s/3)+" "+(y-Math.sin(-Math.PI/4)*s/3+s/12)+",L"+(x+Math.cos(-Math.PI/4)*s/3)+" "+(y-Math.sin(-Math.PI/4)*s/3)+"Z,";
	
	result=result+"M"+(x+Math.cos(-Math.PI*5/12)*s/2)+" "+(y-Math.sin(-Math.PI*5/12)*s/2)+",L"+(x+Math.cos(-Math.PI*5/12)*s/2)+" "+(y-Math.sin(-Math.PI*5/12)*s/2+s/12)+",L"+(x+Math.cos(-Math.PI*7/12)*s/2)+" "+(y-Math.sin(-Math.PI*7/12)*s/2+s/12)+",L"+(x+Math.cos(-Math.PI*7/12)*s/2)+" "+(y-Math.sin(-Math.PI*7/12)*s/2)+"Z,";
	
	result=result+"M"+(x+Math.cos(-Math.PI*3/4)*s/3)+" "+(y-Math.sin(-Math.PI*3/4)*s/3)+",L"+(x+Math.cos(-Math.PI*3/4)*s/2)+" "+(y-Math.sin(-Math.PI*3/4)*s/2)+",L"+(x+Math.cos(-Math.PI*3/4)*s/2)+" "+(y-Math.sin(-Math.PI*3/4)*s/2+s/12)+",L"+(x+Math.cos(-Math.PI*3/4)*s/3)+" "+(y-Math.sin(-Math.PI*3/4)*s/3+s/12)+"Z,";
	
	result=result+"M"+(x+s/6)+" "+y+",S"+x+" "+(y-s/6)+" "+(x-s/6)+" "+y+",A"+(s/6)+" "+(s/6)+" 1 1 1 "+(x+s/6)+" "+y;
	
	return result;
}
//GET LIGHT SHADE OF GEAR, PART OF GEAR
function getGearDarkShade(x,y,s){
	var result="M"+(x+Math.cos(Math.PI*11/12)*s/2)+" "+(y-Math.sin(Math.PI*11/12)*s/2)+",L"+(x+Math.cos(Math.PI*11/12)*s/2)+" "+(y-Math.sin(Math.PI*11/12)*s/2+s/12)+",L"+(x+Math.cos(Math.PI*11/12)*s/3)+" "+(y-Math.sin(Math.PI*11/12)*s/3+s/12)+",L"+(x+Math.cos(Math.PI*11/12)*s/3)+" "+(y-Math.sin(Math.PI*11/12)*s/3)+"Z,";
	
	result=result+"M"+(x+Math.cos(-Math.PI*3/4)*s/2)+" "+(y-Math.sin(-Math.PI*3/4)*s/2)+",L"+(x+Math.cos(-Math.PI*3/4)*s/2)+" "+(y-Math.sin(-Math.PI*3/4)*s/2+s/12)+",L"+(x+Math.cos(-Math.PI*11/12)*s/2)+" "+(y-Math.sin(-Math.PI*11/12)*s/2+s/12)+",L"+(x+Math.cos(-Math.PI*11/12)*s/2)+" "+(y-Math.sin(-Math.PI*11/12)*s/2)+"Z,";
	
	result=result+"M"+(x+Math.cos(-Math.PI*7/12)*s/3)+" "+(y-Math.sin(-Math.PI*7/12)*s/3)+",L"+(x+Math.cos(-Math.PI*7/12)*s/3)+" "+(y-Math.sin(-Math.PI*7/12)*s/3+s/12)+",S"+(x+Math.cos(-Math.PI*2/3)*s/3)+" "+(y-Math.sin(-Math.PI*2/3)*s/3+s/12)+" "+(x+Math.cos(-Math.PI*3/4)*s/3)+" "+(y-Math.sin(-Math.PI*3/4)*s/3+s/12)+",L"+(x+Math.cos(-Math.PI*3/4)*s/3)+" "+(y-Math.sin(-Math.PI*3/4)*s/3)+"Z,";
	
	result=result+"M"+(x+Math.cos(-Math.PI/4)*s/3)+" "+(y-Math.sin(-Math.PI/4)*s/3)+",L"+(x+Math.cos(-Math.PI/4)*s/2)+" "+(y-Math.sin(-Math.PI/4)*s/2)+",L"+(x+Math.cos(-Math.PI/4)*s/2)+" "+(y-Math.sin(-Math.PI/4)*s/2+s/12)+",L"+(x+Math.cos(-Math.PI/4)*s/3)+" "+(y-Math.sin(-Math.PI/4)*s/3+s/12)+"Z";
	
	return result;
}
//GET LINE FOR STROKE WIDTH ICON
function getWidthIcon(x,y,s){
	return "M"+(x-s/2)+" "+y+",L"+(x+s/2)+" "+y; 
}
//GET TEXT "A" ICON
function getTextIcon(x,y,s){
	var result="M"+x+" "+(y-s/2)+",";
	result=result+"L"+(x-s/3)+" "+(y+s/2)+",";
	result=result+"M"+x+" "+(y-s/2)+",";
	result=result+"L"+(x+s/3)+" "+(y+s/2)+",";
	result=result+"M"+(x-s/9*2)+" "+(y+s/6)+",";
	result=result+"L"+(x+s/9*2)+" "+(y+s/6);
	
	return result;
}
//GET MOVE ICON
function getMoveIcon(x,y,s){
	var ss=s/10;
	var result = "M"+(x+ss)+" "+(y-ss)+",";
	result=result+"L"+(x+ss)+" "+(y-s/3)+",";
	result=result+"L"+(x+ss*2)+" "+(y-s/3)+",";
	result=result+"L"+x+" "+(y-s/2)+",";
	result=result+"L"+(x-ss*2)+" "+(y-s/3)+",";
	result=result+"L"+(x-ss)+" "+(y-s/3)+",";
	result=result+"L"+(x-ss)+" "+(y-ss)+",";
	
	result=result+"L"+(x-s/3)+" "+(y-ss)+",";
	result=result+"L"+(x-s/3)+" "+(y-ss*2)+",";
	result=result+"L"+(x-s/2)+" "+y+",";
	result=result+"L"+(x-s/3)+" "+(y+ss*2)+",";
	result=result+"L"+(x-s/3)+" "+(y+ss)+",";
	result=result+"L"+(x-ss)+" "+(y+ss)+",";
	
	result=result+"L"+(x-ss)+" "+(y+s/3)+",";
	result=result+"L"+(x-ss*2)+" "+(y+s/3)+",";
	result=result+"L"+x+" "+(y+s/2)+",";
	result=result+"L"+(x+ss*2)+" "+(y+s/3)+",";
	result=result+"L"+(x+ss)+" "+(y+s/3)+",";
	result=result+"L"+(x+ss)+" "+(y+ss)+",";
	
	result=result+"L"+(x+s/3)+" "+(y+ss)+",";
	result=result+"L"+(x+s/3)+" "+(y+ss*2)+",";
	result=result+"L"+(x+s/2)+" "+y+",";
	result=result+"L"+(x+s/3)+" "+(y-ss*2)+",";
	result=result+"L"+(x+s/3)+" "+(y-ss)+",";
	result=result+"L"+(x+ss)+" "+(y-ss)+",";
	
	return result;
}
//GET TEXT "A" ICON WITH A BOX SURROUNDING
function getTextBoxIcon(x,y,s){
	var result=getTextIcon(x,y,s);
	var ss=s*1.2;
	result=result+getRectToPath(x-ss/2,y-ss/2,ss,ss);
	
	return result;
}
//GET ERASE ONE ICON
function getEraseOneIcon(x,y,s){
	return getRectToPath(x - s / 2, y - s / 3, s, s * 2 / 3);
}
//GET ERASE ALL ICON
function getEraseAllIcon(x,y,s){
	var result=getRectToPath(x - s / 3, y -s/6, s*5/6, s *2/3);
	result=result+getCircleToPath(x-s/6,y-s/6,s/2);
	return result;
}
//GET POLYGON ICON
function getPolygonIcon(x,y,s){
	var result="M"+x+" "+(y-s/2)+",";
	result=result+"L"+(x-s/2)+" "+(y-s/6)+",";
	result=result+"L"+(x+s/6)+" "+(y+s/2)+",";
	result=result+"L"+(x+s/2)+" "+y+",";
	result=result+"L"+(x+s/6)+" "+(y-s/6)+",";
	result=result+"Z";
	
	return result;
}
//GET AVATAR ICON 
function getAvatarIcon(paper,radius,x,y){
	var d = (radius * 2);
	var r = (radius / 2);
	var rr = (radius * .75);

	var result = getRoundedTrapazoidToPath(paper, x, (y + r), (radius * 1.5), d, d/2, r);
	result = result + getCircleToPath((x + radius),y, rr);
	return result;
}
//GET SMILE FACE
function getSmilingFace(paper,set,colour){
	set.push(
		paper.path('M 26.2 21.8 C 26.2 28.2 18.5 32.2 12.4 29 C 9.6 27.6 7.9 24.8 7.9 21.8 L 17 21.8Z').attr({'fill':colour,'stroke':'none','stroke-width':'0','opacity':'0','title':'smiling'}),
		paper.path('M 11.2 26.6 C 11.3 24 16.3 22.5 20.3 23.8 C 24.2 25.1 24.1 28.3 20.1 29.6 C 16.1 30.8 11.2 29.2 11.2 26.7').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'smiling'}),
		paper.path('M 14.9 14.1 C 14.9 17.8 12 20.1 9.8 18.2 C 8.7 17.4 8 15.8 8 14.1 C 8 10.4 10.9 8.2 13.2 10 C 14.3 10.8 14.9 12.4 14.9 14.1Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.8','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'smiling'}),
		paper.path('M 14.2 14.6 C 14.2 17.2 12.1 18.9 10.5 17.5 C 9.7 16.9 9.2 15.8 9.2 14.6 C 9.2 12 11.3 10.3 13 11.6 C 13.7 12.2 14.2 13.4 14.2 14.6Z').attr({'fill':colour,'stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'smiling'}),
		paper.path('M 13.2 16 C 13.2 16.8 12.4 17.3 11.9 16.9 C 11.6 16.7 11.4 16.3 11.4 16 C 11.4 15.1 12.1 14.6 12.7 15 C 13 15.2 13.2 15.6 13.2 16Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'smiling'}),
		paper.path('M 25.4 14 C 25.5 17.7 22.8 19.9 20.7 18.1 C 19.7 17.3 19.1 15.7 19.1 14 C 19.1 10.3 21.8 8 23.9 9.8 C 24.8 10.7 25.5 12.3 25.4 14Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.8','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'smiling'}),
		paper.path('M 24.8 14.5 C 24.8 17.1 22.9 18.7 21.3 17.4 C 20.6 16.8 20.2 15.7 20.2 14.5 C 20.2 12 22.1 10.4 23.6 11.7 C 24.3 12.3 24.8 13.4 24.8 14.5Z').attr({'fill':colour,'stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'smiling'}),
		paper.path('M 23.7 15.9 C 23.7 16.7 23 17.3 22.4 16.8 C 22.1 16.6 22 16.3 22 15.9 C 22 15 22.7 14.5 23.3 14.9 C 23.5 15.1 23.7 15.5 23.7 15.9Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'smiling'})
	);
	
	var result=new Array();
	result["centerX"]=30.6;
	result["centerY"]=30.5;
	result["set"]=set;
	return result;
}
//GET NORMAL FACE
function getNormalFace(paper,set,colour){
	set.push(
		paper.path('M 13.7 14.8 C 13.7 17.1 12.5 18.9 10.9 18.9 C 9.4 18.9 8.2 17.1 8.2 14.8 C 8.2 12.5 9.4 10.7 10.9 10.7 C 12.5 10.7 13.7 12.5 13.7 14.8Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.8','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'normal'}),
		paper.path('M 12.9 15.5 C 12.9 17 12 18.2 10.9 18.2 C 9.8 18.2 8.9 17 8.9 15.5 C 8.9 13.9 9.8 12.7 10.9 12.7 C 12 12.7 12.9 13.9 12.9 15.5Z').attr({'fill':colour,'stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'normal'}),
		paper.path('M 12.1 16.3 C 12.1 16.7 11.8 17 11.5 17 C 11.2 17 10.9 16.7 10.9 16.3 C 10.9 16 11.2 15.7 11.5 15.7 C 11.8 15.7 12.1 16 12.1 16.3Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'normal'}),
		paper.path('M 23.9 14.7 C 23.9 17 22.7 18.8 21.3 18.8 C 19.8 18.8 18.6 17 18.6 14.7 C 18.6 12.4 19.8 10.5 21.3 10.5 C 22.7 10.5 23.9 12.4 23.9 14.7Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.8','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'normal'}),
		paper.path('M 23.4 15.2 C 23.4 16.8 22.5 18 21.4 18 C 20.3 18 19.4 16.8 19.4 15.2 C 19.4 13.7 20.3 12.4 21.4 12.4 C 22.5 12.4 23.4 13.7 23.4 15.2Z').attr({'fill':colour,'stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'normal'}),
		paper.path('M 22.6 16.2 C 22.6 16.6 22.4 16.9 22.1 16.9 C 21.7 16.9 21.5 16.6 21.5 16.2 C 21.5 15.9 21.7 15.6 22.1 15.6 C 22.4 15.6 22.6 15.9 22.6 16.2Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'normal'}),
		paper.path('M 6.2 23.9 C 15.9 39 26 23.8 26 23.8').attr({'fill':'none','stroke':colour,'stroke-width':'1.15','stroke-linecap':'butt','stroke-linejoin':'miter','opacity':'0','title':'normal'})
	);
	
	var result=new Array();
	result["centerX"]=28.4;
	result["centerY"]=30.5;
	result["set"]=set;
	return result;
}
//GET ANGRY FACE
function getAngryFace(paper,set,colour){
	set.push(
		paper.path('M 15.3 15.3 C 15.1 17.6 13.5 19.3 11.7 18.9 C 9.9 18.6 8.6 16.5 8.8 14.2 C 9 11.8 11.1 15 12.9 15.3 C 14.7 15.6 15.5 13 15.3 15.3Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.18','stroke-miterlimit':'4','opacity':'0','title':'angry'}),
		paper.path('M 15.6 14.5 C 15.1 15 15.1 15.2 13.6 15.2 C 12.1 15.2 8.5 11.3 8.5 13.4').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.98','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'angry'}),
		paper.path('M 14.4 15.5 C 14.6 16.9 13.7 18 12.7 17.5 C 11.9 17.1 11.5 15.9 11.9 14.9 L 13.1 15.8Z').attr({'fill':colour,'stroke':colour,'stroke-width':'0.6','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'angry'}),
		paper.path('M 14.1 16.3 C 14.1 16.5 13.8 16.7 13.6 16.6 C 13.4 16.5 13.4 16.4 13.4 16.3 C 13.4 16 13.7 15.8 13.9 15.9 C 14 16 14.1 16.1 14.1 16.3Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'angry'}),
		paper.path('M 16.8 15.5 C 17 17.9 18.6 19.5 20.5 19.2 C 22.4 18.9 23.7 16.7 23.5 14.4 C 23.3 12.1 21.1 15.3 19.2 15.6 C 17.4 15.9 16.5 13.2 16.8 15.5Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.18','stroke-miterlimit':'4','opacity':'0','title':'angry'}),
		paper.path('M 16.5 14.6 C 17 15 17 15.3 18.6 15.3 C 20.2 15.3 23.9 11.6 23.9 13.6').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.97','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'angry'}),
		paper.path('M 17.7 15.7 C 17.5 17 18.4 18.1 19.4 17.6 C 20.1 17.3 20.6 16.3 20.4 15.4').attr({'fill':colour,'stroke':colour,'stroke-width':'0.6','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'angry'}),
		paper.path('M 18 16.3 C 18 16.6 18.3 16.8 18.6 16.7 C 18.7 16.6 18.8 16.5 18.8 16.3 C 18.8 16.1 18.5 15.9 18.2 16 C 18.1 16.1 18 16.2 18 16.3Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'angry'}),
		paper.path('M 24.4 24.6 C 26.4 26.5 22.9 27.5 20.3 26.9 C 15.9 26.4 15.5 27.2 13 27.6 C 9.3 28.4 7.8 27.2 7.8 24.6 C 7.8 22.8 8.9 20.8 10.6 20.8 C 12.3 20.7 14.7 25.6 16.6 25.6 C 20.4 25.6 21.2 21.4 24.4 24.6Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.62','opacity':'0','title':'angry'}),
		paper.path('M 24.6 25.1 C 21.6 26 18 26.3 15.3 25.8 C 12.6 25.3 8.6 24.3 8.5 22.1').attr({'fill':'none','stroke':colour,'stroke-width':'0.15','stroke-miterlimit':'4','opacity':'0','title':'angry'}),
		paper.path('M 23 24.4 C 23.6 25.3 23.4 25.8 23.5 26.3').attr({'fill':'none','stroke':colour,'stroke-width':'0.17','stroke-linecap':'butt','stroke-linejoin':'miter','stroke-miterlimit':'4','opacity':'0','title':'angry'})
	);

	var result=new Array();
	result["centerX"]=28.55;
	result["centerY"]=30.5;
	result["set"]=set;
	return result;
}
//GET OFFLINE FACE
function getOfflineFace(paper,set,colour){
	set.push(
		paper.path('M 5.9 16.5 C 9.5 19.9 13.7 16.5 13.7 16.5').attr({'fill':'none','stroke':colour,'stroke-width':'0.94','stroke-linecap':'butt','stroke-linejoin':'miter','opacity':'0','title':'offline'}),
		paper.path('M 17.8 16.6 C 21.6 19.4 25.9 16.6 25.9 16.6').attr({'fill':'none','stroke':colour,'stroke-width':'1.13','stroke-linecap':'butt','stroke-linejoin':'miter','opacity':'0','title':'offline'}),
		paper.path('M 6.4 12.6 C 8.8 11 11.4 11.2 11.4 11.2').attr({'fill':'none','stroke':colour,'stroke-width':'1','stroke-linecap':'butt','stroke-linejoin':'miter','opacity':'0','title':'offline'}),
		paper.path('M 24.5 12.8 C 22.4 10.7 19.5 11.1 19.5 11.1').attr({'fill':'none','stroke':colour,'stroke-width':'1','stroke-linecap':'butt','stroke-linejoin':'miter','opacity':'0','title':'offline'})
	);

	var result=new Array();
	result["centerX"]=28.55;
	result["centerY"]=30.5;
	result["set"]=set;
	return result;
}
//GET LOVE FACE
function getLoveFace(paper,set,colour){
	set.push(
		paper.path('M 10.3 18 C 10.3 18 7.7 16.4 6.6 15.6 C 5.9 15 3.8 13.6 4.6 11.7 C 5.9 8.7 9.2 11.7 9.2 11.7 C 9.2 11.7 12.2 7.8 13.7 10.2 C 14.9 12.1 13.1 13.6 12.7 14.5 C 12.2 15.8 10.3 18 10.3 18Z').attr({'fill':colour,'stroke':colour,'stroke-width':'1.83','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'love'}),
		paper.path('M 21.6 18.1 C 21.6 18.1 19.8 15.7 19 14.6 C 18.5 13.9 17.1 11.9 18.4 10.2 C 20.5 7.7 22.5 11.6 22.5 11.6 C 22.5 11.6 26.5 8.8 27.1 11.5 C 27.7 13.8 25.6 14.7 24.9 15.5 C 24 16.6 21.6 18.1 21.6 18.1Z').attr({'fill':colour,'stroke':colour,'stroke-width':'1.81','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'love'}),
		paper.path('M 8 22.8 C 8.1 18.6 11.7 24.6 16 24.7 C 20.3 24.7 23.7 18.9 23.6 23.1 C 23.5 27.2 20 30.5 15.7 30.4 C 11.4 30.3 8 27 8 22.9').attr({'fill':colour,'stroke':colour,'stroke-width':'0.8','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'love'}),
		paper.path('M 20.1 27.8 C 20.1 29.7 16.7 30.9 14 30 C 12.7 29.5 12 28.7 12 27.8 C 12 26 15.3 24.8 18 25.7 C 19.3 26.2 20.1 27 20.1 27.8Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'love'})
	);
	
	var result=new Array();
	result["centerX"]=28.55;
	result["centerY"]=30.5;
	result["set"]=set;
	return result;
}
//GET CONFUSED FACE
function getConfusedFace(paper,set,colour){
	set.push(
		paper.path('M 5.4 10.8 C 6.1 9 8.2 8.1 9.9 8.9').attr({'fill':'none','stroke':colour,'stroke-width':'0.88','stroke-miterlimit':'4','opacity':'0','title':'confused'}),
		paper.path('M 21.8 8.6 C 23.6 7.8 25.6 8.6 26.4 10.3').attr({'fill':'none','stroke':colour,'stroke-width':'0.88','stroke-miterlimit':'4','opacity':'0','title':'confused'}),
		paper.path('M 8 16.3 C 8.3 15.6 9.2 15.4 9.9 15.7 C 10.9 16.1 11.2 17.2 10.8 18.1 C 10.2 19.3 8.7 19.6 7.5 19.1 C 6 18.4 5.6 16.6 6.3 15.2 C 7.2 13.4 9.5 12.9 11.3 13.8 C 13.4 14.9 14 17.5 12.9 19.5').attr({'fill':'none','stroke':colour,'stroke-width':'1','stroke-linecap':'butt','stroke-linejoin':'miter','stroke-miterlimit':'4','opacity':'0','title':'confused'}),
		paper.path('M 24.7 15.7 C 24.3 14.7 23.1 14.4 22.2 14.8 C 20.9 15.4 20.5 17 21.1 18.2 C 21.8 19.8 23.8 20.3 25.3 19.5 C 27.3 18.6 27.9 16 26.9 14.1 C 25.8 11.7 22.7 10.9 20.5 12.2 C 17.7 13.7 16.8 17.4 18.3 20.2').attr({'fill':'none','stroke':colour,'stroke-width':'1','stroke-linecap':'butt','stroke-linejoin':'miter','stroke-miterlimit':'4','opacity':'0','title':'confused'}),
		paper.path('M 6.6 26.7 C 7 25.8 7.9 25.2 8.9 25.8 C 9.6 26.3 10 26.7 10.7 26.6 C 11.3 26.5 11.7 25.5 12.8 25.5 C 13.7 25.4 14.3 26.6 14.9 26.6 C 15.7 26.7 16.2 25.5 17 25.5 C 18.2 25.5 18.4 26.7 19.3 26.6 C 20.5 26.6 20.6 25.5 21.6 25.5 C 22.8 25.6 22.9 26.8 23.9 26.8 C 25 26.8 25.8 25.4 25.8 25.4').attr({'fill':'none','stroke':colour,'stroke-width':'0.6','stroke-linecap':'butt','stroke-linejoin':'miter','stroke-miterlimit':'4','opacity':'0','title':'confused'})
	);
	
	var result=new Array();
	result["centerX"]=28.55;
	result["centerY"]=30.5;
	result["set"]=set;
	return result;
}
//GET SURPRISED FACE
function getSurprisedFace(paper,set,colour){
	set.push(
		paper.path('M 14.3 16.8 C 14.3 21.7 10.8 24.8 8 22.3 C 6.7 21.2 5.8 19.1 5.8 16.8 C 5.8 11.9 9.4 8.9 12.2 11.3 C 13.5 12.4 14.3 14.5 14.3 16.8Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.61','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'surprised'}),
		paper.path('M 13 18.2 C 13 20.1 11.1 21.2 9.5 20.3 C 8.8 19.9 8.4 19.1 8.4 18.2 C 8.4 16.4 10.3 15.3 11.8 16.2 C 12.5 16.6 13 17.4 13 18.2Z').attr({'fill':colour,'stroke':colour,'stroke-width':'0.8','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'surprised'}),
		paper.path('M 12.6 18.8 C 12.6 19.3 12 19.7 11.5 19.4 C 11.3 19.3 11.2 19 11.2 18.8 C 11.2 18.2 11.8 17.9 12.2 18.2 C 12.4 18.3 12.6 18.5 12.6 18.8Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'surprised'}),
		paper.path('M 26.6 16.9 C 26.6 22 23.1 25.2 20.2 22.7 C 18.9 21.5 18.1 19.3 18.1 16.9 C 18.1 11.8 21.6 8.6 24.5 11.1 C 25.8 12.3 26.6 14.5 26.6 16.9Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.61','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'surprised'}),
		paper.path('M 24.3 18 C 24.3 19.8 22.4 20.9 20.9 20 C 20.2 19.6 19.7 18.8 19.7 18 C 19.7 16.2 21.7 15.1 23.2 16 C 23.9 16.4 24.3 17.2 24.3 18Z').attr({'fill':colour,'stroke':colour,'stroke-width':'0.8','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'surprised'}),
		paper.path('M 23.7 18.9 C 23.7 19.4 23.2 19.8 22.7 19.5 C 22.5 19.4 22.3 19.1 22.3 18.9 C 22.3 18.3 22.9 18 23.4 18.3 C 23.6 18.4 23.7 18.6 23.7 18.9Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.1','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'surprised'}),
		paper.path('M 19.4 27.4 C 19.4 30.3 17 32.1 15.2 30.6 C 14.3 30 13.8 28.7 13.8 27.4 C 13.8 24.5 16.1 22.8 18 24.2 C 18.8 24.9 19.4 26.1 19.4 27.4Z').attr({'fill':colour,'stroke':colour,'stroke-width':'0.5','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'surprised'}),
		paper.path('M 18.4 29.1 C 18.4 30.6 16.9 31.6 15.8 30.8 C 15.3 30.5 14.9 29.8 14.9 29.1 C 14.9 27.6 16.4 26.7 17.5 27.4 C 18 27.8 18.4 28.4 18.4 29.1Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.17','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'surprised'}),
		paper.path('M 7.6 8.3 C 8.1 7.4 9.5 6.8 10.6 7.4 C 10.8 7.6 11 8 11.2 8.2').attr({'fill':'none','stroke':colour,'stroke-width':'0.65','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'surprised'}),
		paper.path('M 20.7 8.1 C 21.2 7.1 22.5 6.6 23.6 7.2 C 23.9 7.4 24.1 7.8 24.2 8').attr({'fill':'none','stroke':colour,'stroke-width':'0.65','stroke-linecap':'round','stroke-miterlimit':'4','opacity':'0','title':'surprised'})
	);

	var result=new Array();
	result["centerX"]=28.55;
	result["centerY"]=30.5;
	result["set"]=set;
	return result;
}
//GET UPSET FACE
function getUpsetFace(paper,set,colour){
	set.push(
		paper.path('M 24.1 13 C 24 17.9 21.4 20.8 19.3 18.2 C 18.5 17.1 18 15.4 17.9 13.4').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.16','stroke-miterlimit':'4','opacity':'0','title':'upset'}),
		paper.path('M 9.6 26.4 C 10.8 23.8 14.7 22.5 18.2 23.4 C 20.2 23.9 21.7 24.9 22.4 26.3').attr({'fill':'none','stroke':colour,'stroke-width':'1','stroke-miterlimit':'4','opacity':'0','title':'upset'}),
		paper.path('M 13.8 9.1 C 13.2 10.5 11.3 11.3 9.5 10.9 C 9.2 10.9 8.9 10.8 8.7 10.7').attr({'fill':'none','stroke':colour,'stroke-width':'1','stroke-miterlimit':'4','opacity':'0','title':'upset'}),
		paper.path('M 23.1 10.6 C 21.6 11.3 19.4 10.9 18.4 9.7 C 18.2 9.5 18.1 9.3 18 9.1').attr({'fill':'none','stroke':colour,'stroke-width':'1','stroke-miterlimit':'4','opacity':'0','title':'upset'}),
		paper.path('M 6.6 13.8 C 8.3 13 11.7 12.8 14.3 13.5 C 14.5 13.6 14.8 13.6 15 13.7').attr({'fill':colour,'stroke':colour,'stroke-width':'0.59','stroke-miterlimit':'4','opacity':'0','title':'upset'}),
		paper.path('M 22.9 13.8 C 22.8 17 21.1 18.7 19.9 16.8 C 19.4 16.2 19.1 15.1 19.1 13.9 L 21 13.4Z').attr({'fill':colour,'stroke':colour,'stroke-width':'1','stroke-miterlimit':'4','opacity':'0','title':'upset'}),
		paper.path('M 16.6 13.9 C 18.6 12.8 22.7 12.7 25.3 13.8').attr({'fill':colour,'stroke':colour,'stroke-width':'0.59','stroke-miterlimit':'4','opacity':'0','title':'upset'}),
		paper.path('M 23 14.9 C 23 15.7 22.3 16.2 21.7 15.8 C 21.4 15.6 21.2 15.2 21.2 14.9 C 21.2 14 22 13.5 22.6 13.9 C 22.8 14.1 23 14.5 23 14.9Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.67','stroke-miterlimit':'4','opacity':'0','title':'upset'}),
		paper.path('M 13.8 13.9 C 13.7 18.2 11 20.4 9 18 C 8.2 17 7.7 15.4 7.7 13.7 L 10.8 13.5Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.2','stroke-miterlimit':'4','opacity':'0','title':'upset'}),
		paper.path('M 13.2 13.2 C 12.6 18.3 10.1 19.4 8.8 15.3 C 8.6 14.6 8.4 13.9 8.3 13.1').attr({'fill':colour,'stroke':colour,'stroke-width':'0.2','stroke-miterlimit':'4','opacity':'0','title':'upset'}),
		paper.path('M 12.7 14.5 C 12.7 15.4 12 15.9 11.4 15.5 C 11.1 15.3 11 14.9 11 14.5 C 11 13.6 11.7 13.1 12.3 13.5 C 12.5 13.7 12.7 14.1 12.7 14.5Z').attr({'fill':'#ffffff','stroke':colour,'stroke-width':'0.67','stroke-miterlimit':'4','opacity':'0','title':'upset'})
	);
	
	var result=new Array();
	result["centerX"]=28.55;
	result["centerY"]=30.5;
	result["set"]=set;
	return result;
}