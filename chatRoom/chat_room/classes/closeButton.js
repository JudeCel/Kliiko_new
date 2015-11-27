var view = namespace('sf.ifs.View');

/*
	format for the json
	{
		position: {
			x:	 			int,
			y:				int,
		},
		radius: 			int,
			
	}
*/
view.CloseButton = function(json) {
	this.json = json;
	
	this.button = null;
};

view.Button.prototype.draw = function() {
	var animationFadeObject = Raphael.animation({"opacity": 0.5}, 500);

};
