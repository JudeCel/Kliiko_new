var view = namespace('sf.ifs.View');

/*
	format for the json
	{
		x:	 				int,
		y:					int,
		margin:				int,			//	gap between the text and the menu item
		radius:				int,			//	radius for the rounded corners of the menu item
		attrLabel: {						//	background for our menu item
			...		//	same as for Raphaël
		},
		attrLabelText: {					//	attributes for our text
			...		//	same as for Raphaël
		},
		attrLabelHover: {					//	background for our menu when hovering over it
		...		//	same as for Raphaël
		}
		thisMain:			pointer,		//	pointer to the "this" structure in topic.html
		paper:				pointer,		//	pointer to the canvas we are drawing on
		topic: {
			id:				int,
			session_name:	string,			//	name of the session
			name:			string,			//	name of the topic
			status:			string,			//	"Active" | "Closed"
			active_topic:	string,			//	"true" | "false"
			start_time:		string,			//	"yyyy-mm-dd hh:mm:ss"
			end_time:		string			//	"yyyy-mm-dd hh:mm:ss"
		}
	}
*/
view.TopicMenuItem = function(json) {
	this.json = json;
	
	this.topicMenuItem = null;
};

view.TopicMenuItem.prototype.draw = function() {
	//	make sure we remove any old objects first
	if (this.topicMenuItem) {
		if (this.topicMenuItem[0]) {
			if (this.topicMenuItem.stop) this.topicMenuItem.stop();
			this.topicMenuItem.remove();
		}
	}
	
	this.topicMenuItem = this.json.paper.set();
	
	
	//	lets draw our text first, mainly so we can see how big it is
	var textX = this.json.x,
		textY = this.json.y;
		
	this.labelText = this.json.paper.text(textX, textY, this.json.topic.name).attr(this.json.attrLabelText);
	var labelBBox = this.labelText.getBBox();
	var labelX = labelBBox.x - this.json.margin,
		labelY = labelBBox.y - this.json.margin,
		labelWidth = labelBBox.width + (2 * this.json.margin),
		labelHeight = labelBBox.height + (2 * this.json.margin);
		
	if (this.json.topic.id === this.json.thisMain.topicID)
		this.label = this.json.paper.path(getRoundedRectToPath(labelX, labelY, labelWidth, labelHeight, this.json.radius)).attr(this.json.attrSelectedLabel);
	else
		this.label = this.json.paper.path(getRoundedRectToPath(labelX, labelY, labelWidth, labelHeight, this.json.radius)).attr(this.json.attrLabel);

	this.labelText.toFront();
	
	this.topicMenuItem.push(this.label, this.labelText);
	
	this.topicMenuItem.data("this", this);

	//	set up the events for our menu item
	this.topicMenuItem.click(function() {
		var me = this.data("this");
		
		me.json.thisMain.setTopic(me.json.topic.id);
		//alert("> " + me.json.topic.name + " : " + me.json.topic.id);
	});
	
	//	what happens if we hover over the button?
	this.topicMenuItem.hover(
		//	hover in
		function() {
			var me = this.data("this");
			
			if (me.json.topic.id === me.json.thisMain.topicID)
				me.label.attr(me.json.attrSelectedLabelHover);
			else
				me.label.attr(me.json.attrLabelHover);
		},
		//	hover out
		function() {
			var me = this.data("this");
			if (me.json.topic.id === me.json.thisMain.topicID)
				me.label.attr(me.json.attrSelectedLabel);
			else
				me.label.attr(me.json.attrLabel);
		}
	);
};

view.TopicMenuItem.prototype.getBBox = function() {
	return this.topicMenuItem.getBBox();
};

