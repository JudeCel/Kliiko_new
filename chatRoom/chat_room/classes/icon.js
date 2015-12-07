var view = namespace('sf.ifs.View');

/*
	json: {
		x: int,
		y: int,
		path: string,
		paper:paper
	}
*/

view.Icon = function(json) {
	this.json = json;

	this.icon = null;
};

view.Icon.prototype.draw = function() {
	var scale = "s0.6";
	
	if (this.icon) {
		if (this.icon[0]) this.icon.remove();
	}
	
	this.icon = this.json.paper.set();
	//alert(this.json.click);

	var x = this.json.x - DEFAULT_ICON_RADIUS,
		y = this.json.y - DEFAULT_ICON_RADIUS;
		cx = this.json.x + DEFAULT_ICON_RADIUS,
		cy = this.json.y + DEFAULT_ICON_RADIUS;
		
	//	make sure we have an id
	this.id = (!isEmpty(this.json.id)) ? this.json.id : 0;
	
	var background = this.json.paper.circle(cx, cy, DEFAULT_ICON_RADIUS).attr({fill: "#555555", stroke: "#fff", "stroke-width": 2});
	var path = this.json.paper.path(this.json.path);
	path.transform("t" + x + "," + y + scale).attr({fill: "#fff", "stroke-width": 0});

	this.icon.push(
		background,
		path
	);

	//	do we have a callback for click?
	this.icon.data("this", this);

	if (!isEmpty(this.json.click)) {
		this.icon.click(function() {
			me = this.data("this");
			me.json.click(me.id);
            /*
			if(typeof me.json.remove != undefined && me.json.remove){
				try{
					me.icon.remove();
				} catch(e) {}
			}
            */
            if(me.json.jsonButton && me.json.jsonButton.menu){
                menu = me.json.jsonButton.menu;

                menu.resources.splice(me.json.jsonButton.resourceIndex, 1);
                menu.destroy();
                menu.draw();
            }

            ///me.json.button.remove();

        })
	}

	//	what happens if we hover over the button?
	this.icon.hover(
		//	hover in
		function() {
			if (this.animate) {		
				var animationHoverIn = Raphael.animation({"opacity": 1}, 500);
				if (!this.removed) this.animate(animationHoverIn.delay(0));
			}
		},
		//	hover out
		function() {
			if (this.animate) {		
				var animationHoverOut = Raphael.animation({"opacity": 0.5}, 500);
				if (!this.removed) this.animate(animationHoverOut.delay(0));
			}
		}
	);
	
	return this.icon;
};

view.Icon.prototype.getIcon = function() {
	return this.icon;
};

view.Icon.prototype.sendToFront = function() {	//	hopefully this overrides the normal one...
	for (var ndx = 0, il = this.icon.length; ndx < il; ndx++) {
		this.icon[ndx].toFront();
	}
}