var view = namespace('sf.ifs.View');

/*
	format for the json
	{
		position: {
			x:	 			int,
			y:				int,
		},
		margin:				int,			//	gap between the text and the menu item
		radius:				int, 			//	radius for the rounded corners of the menu item
		type:				string,			//	text (default) | image | svg | audio
		label:				string,
		title: 				string,
		active_topic:		int,
		counterId:			int,			//	if we need to display a counter, what is the id for it?
		showCounter:		boolean,		//	do we need to display a counter for this button?
		hoverHint: 			string,
		size: {								//	size of image or svg (see type:)
			width,
			height
		},
		attrLabel: {						//	background for our menu item
			...		//	same as for Raphaël
		},
		attrLabelText: {					//	attributes for our text (see type:)
			...		//	same as for Raphaël
		},
		attrLabelHover: {					//	background for our menu when hovering over it
		...		//	same as for Raphaël
		},
		click:				pointer,		//	pointer to a callback function
		draggable:			boolean,		//	false (default) | true - the item can be dragged
		onDragUp:			pointer,		//	pointer to the routine to call when finished dragging
		targetRect: {						//	specifies the area to highlight when dragging
			x:				int,
			y:				int,
			width: 			int,
			height:			int
		},
		thisMain:			pointer,		//	pointer to the "this" structure in topic.html
		paper:				pointer			//	pointer to the canvas we are drawing on
	}
*/
view.Button = function(json) {
	this.json = json;
	
	this.button = null;
};

view.Button.prototype.draw = function() {
	var animationFadeObject = Raphael.animation({"opacity": 0.5}, 500);

	//	make sure we remove any old objects first
	if (this.button) {
		if (this.button[0]) this.button.remove();
	}
	
	this.button = this.json.paper.set();

	if (isEmpty(this.json.type))	this.json.type = 'text';
	if (isEmpty(this.json.draggable)) this.json.draggable = false;
	
	switch (this.json.type) {
		case 'text': {
			//	lets draw our text first, mainly so we can see how big it is
			var textX = this.json.position.x,
				textY = this.json.position.y;

			this.labelText = this.json.paper.text(textX, textY, this.json.label).attr(this.json.attrLabelText);
			var labelBBox = this.labelText.getBBox();
			
			var labelX = labelBBox.x - this.json.margin,
				labelY = labelBBox.y - this.json.margin,
				labelWidth = 0,
				labelHeight = labelBBox.height + (2 * this.json.margin);

			if (isEmpty(this.json.size)) {
				labelWidth = labelBBox.width + (2 * this.json.margin);
			} else {
				labelWidth = this.json.size.width - this.json.margin - 1;
			}
		
			this.label = this.json.paper.path(getRoundedRectToPath(labelX, labelY, labelWidth, labelHeight, this.json.radius)).attr(this.json.attrLabel);

			this.labelText.toFront();

			if (typeof this.label.animate != 'undefined') {
				this.label.animate(animationFadeObject.delay(0));
				if (!this.labelText.removed) this.labelText.animate(animationFadeObject.delay(0));
			}

			this.button.push(
				this.label,
				this.labelText
			);

			//	do we need to display a counter?
			if (this.json.showCounter) {
				var count = 0,
					countReplies = 0;
				
				//	lets get the current count
				if (!isEmpty(window.topicChatCounter['topic_' + this.json.counterId])) count = window.topicChatCounter['topic_' + this.json.counterId].count;

				var counter = createCounter({
					paper: this.json.paper, 
					x: (textX + labelWidth - 25),
					y: (textY - 8),
					count: count,
					opacity: 0.5
				});

				//	lets get the current count of replies
				if (!isEmpty(window.topicRepliesCounter['topic_' + this.json.counterId])) countReplies = window.topicRepliesCounter['topic_' + this.json.counterId].count;

				var counterReplies = createCounter({
					paper: this.json.paper, 
					x: (textX + labelWidth - 25),
					y: (textY + 20 - 8),
					count: countReplies,
					opacity: 0.5,
					colour: '#304064'
				});

				this.button.push(
					counter.background,
					counter.text,
					counterReplies.background,
					counterReplies.text
				);
			}
		}
		break;
		case 'image': {
			var dimensions = getFittedDimensions(this.json.actualSize.width, this.json.actualSize.height, this.json.size.width, this.json.size.height);
			
			//	lets centre this image
			var x = this.json.position.x + ((this.json.size.width - dimensions.width) / 2);
			var y = this.json.position.y + ((this.json.size.height - dimensions.height) / 2);
			this.label = this.json.paper.image(this.json.label, x, y, dimensions.width, dimensions.height);
			this.label.attr({title:this.json.hoverHint});
			

			this.button.push(this.label);

			var onCloseClick = function(id) {
				//thisMain.deleteResource(id);
                thisMain.deleteResourceWithoutHideMenu(id);
			}

			var iconJSON = {
				id:			this.json.id,
				x:			x - DEFAULT_ICON_RADIUS,
				y:			y - DEFAULT_ICON_RADIUS,
				click:		onCloseClick,
				path:		getClosePath(),
				remove: 	true,
				thisMain:	this.json.thisMain,
				paper:		this.json.paper,
                jsonButton: this.json
			};

			var close = new sf.ifs.View.Icon(iconJSON);
			close.draw();
			//this.button.push(close.getIcon());
			this.json.menuLayer.push(close.getIcon());
		}
		break;
		case 'video': {
			this.label = this.json.paper.image(window.URL_PATH + window.CHAT_ROOM_PATH + "resources/images/youtubeThumb.png", this.json.position.x, this.json.position.y, this.json.size.width, this.json.size.height);
			this.label.attr({title:this.json.hoverHint});
			
			this.button.push(this.label);		

			var x = this.json.position.x ;
			var y = this.json.position.y ;
			var onCloseClick = function(id) {
				//thisMain.deleteResource(id);
                thisMain.deleteResourceWithoutHideMenu(id);
			};

			var iconJSON = {
				id:			this.json.id,
				x:			x - DEFAULT_ICON_RADIUS,
				y:			y - DEFAULT_ICON_RADIUS,
				click:		onCloseClick,
				path:		getClosePath(),
				remove: 	true,
				thisMain:	this.json.thisMain,
				paper:		this.json.paper,
                jsonButton: this.json
            };
	
			var close = new sf.ifs.View.Icon(iconJSON);
			close.draw();
			//this.button.push(close.getIcon());
			this.json.menuLayer.push(close.getIcon());
		}
		break;
		case 'audio': {
			this.label = this.json.paper.image(window.URL_PATH + window.CHAT_ROOM_PATH + "resources/images/audioThumb.png", this.json.position.x, this.json.position.y, this.json.size.width, this.json.size.height);
			this.label.attr({title:this.json.hoverHint});
			
			this.button.push(this.label);

			var x = this.json.position.x ;
			var y = this.json.position.y ;
			var onCloseClick = function(id) {
				//thisMain.deleteResource(id);
                thisMain.deleteResourceWithoutHideMenu(id);
			};

			var iconJSON = {
				id:			this.json.id,
				x:			x - DEFAULT_ICON_RADIUS,
				y:			y - DEFAULT_ICON_RADIUS,
				click:		onCloseClick,
				path:		getClosePath(),
				remove: 	true,
				thisMain:	this.json.thisMain,
				paper:		this.json.paper,
                jsonButton: this.json
			}
	
			var close = new sf.ifs.View.Icon(iconJSON);
			close.draw();		
			//this.button.push(close.getIcon());
			this.json.menuLayer.push(close.getIcon());
		}
		break;
		case 'vote': {
			this.label = this.json.paper.image(window.URL_PATH + window.CHAT_ROOM_PATH + "resources/images/voteThumb.png", this.json.position.x, this.json.position.y, this.json.size.width, this.json.size.height);
			this.label.attr({title:this.json.hoverHint});

			this.button.push(this.label);	

			var x = this.json.position.x ;
			var y = this.json.position.y ;
			//-------------------------------------------------------
			// Close Icon for Delete function on Each Button
			//-------------------------------------------------------
			var onCloseClick = function(id) {
				//thisMain.deleteResource(id);
                thisMain.deleteResourceWithoutHideMenu(id);
			};

			var iconJSON = {
				id:			this.json.id,
				x:			x - DEFAULT_ICON_RADIUS,
				y:			y - DEFAULT_ICON_RADIUS,
				click:		onCloseClick,
				path:		getClosePath(),
				remove: 	true,
				thisMain:	this.json.thisMain,
				paper:		this.json.paper,
                jsonButton: this.json
            };
			//console.log(iconJSON.click);
	
			var close = new sf.ifs.View.Icon(iconJSON);
			close.draw();	
			this.json.menuLayer.push(close.getIcon());	

			//-------------------------------------------------------
			// Pen Icon for Edit function on Each Button
			//-------------------------------------------------------
			var onEditClick = function() {
				//thisMain.deleteResource(id);
				this.thisLocal.hide();

				voteMenuEditHandler(this.id);
			};

			iconJSON = {
				id:			this.json.id,
				x:			x + DEFAULT_ICON_RADIUS + 3,
				y:			y - DEFAULT_ICON_RADIUS,
				click:		onEditClick,
				path:		getEditPath(),
				remove: 	true,
				thisLocal: 	this.json.thisLocal,
				thisMain:	this.json.thisMain,
				paper:		this.json.paper
			};
			//console.log(iconJSON.click);
	
			var edit = new sf.ifs.View.Icon(iconJSON);
			edit.draw();
			this.json.menuLayer.push(edit.getIcon());
		}
		break;
		case 'svg': {
			
		}
	}

	if (!isEmpty(this.json.title)) {
		var title = decodeURI(this.json.title);
		//	lets draw out title now
		var textX = this.json.position.x + (this.json.size.width / 2),
			textY = this.json.position.y + this.json.size.height + 16;
			
		if(title.length>20){
			title = title.substring(0,16)+"...";
		}
		var titleText = this.json.paper.text(textX, textY, title).attr(this.json.attrTitle);

		this.button.push(titleText);
	}

	this.button.data("this", this);
	
	//	do we have a callback for click?
	if (!isEmpty(this.json.click)) {
		this.button.click(function() {
			me = this.data("this");
			var json = {
				text: me.json.label,
				active_topic: me.json.active_topic
			};
			me.json.click(json);
		})
	}

	//	what happens if we hover over the button?
	this.button.hover(
		//	hover in
		function() {
			if (isEmpty(this.data)) return;
			//if (typeof this.data === "object") {
				var me = this.data("this");
				
				var animationHoverIn = Raphael.animation({"opacity": 1.0}, 250);

				if (typeof me.button != 'undefined') {
					for (var ndx = 0, lb = me.button.length; ndx < lb; ndx++) {
						if (typeof me.button[ndx].animate != 'undefined') {
							if (!me.button[ndx].removed) me.button[ndx].animate(animationHoverIn.delay(0));
						}
					}
				}
			//}
		},
		//	hover out
		function() {
			if (isEmpty(this.data)) return;
			//if (typeof this.data === "object") {
				var me = this.data("this");
				var animationHoverOut = Raphael.animation({"opacity": 0.5}, 250);
				
				if (typeof me.button != 'undefined') {
					for (var ndx = 0, lb = me.button.length; ndx < lb; ndx++) {
						if (typeof me.button[ndx].animate != 'undefined') {
							if (!me.button[ndx].removed) me.button[ndx].animate(animationHoverOut.delay(0));
						}
					}
				}
			//}
		}
	);
	
	onDragStart = function (x, y, event) {
		//console.log(':onDragStart...');
		//event.preventDefault();
		var me = this.data("this");
		
		//	firstly, lets create a target area...
		if (!isEmpty(this.target)) {
			this.target.remove();
			this.target = null;
		}
		
		this.target = me.json.paper.set();
		for (var ndx = 0, tl = me.json.targetRect.length; ndx < tl; ndx++) {
			this.target.push(me.json.paper.rect(me.json.targetRect[ndx].x, me.json.targetRect[ndx].y, me.json.targetRect[ndx].width, me.json.targetRect[ndx].height).attr({stroke: "#8080ff", "stroke-width": 2, "stroke-dasharray": "-", "fill-opacity": 0.25}));
		}

		this.ox = 0;
		this.oy = 0;
		
		this.original = {
			x:	this.attrs.x + me.json.size.width / 2,//220
			y:	this.attrs.y + me.json.size.height / 2//160
		};

		this.original = {
			x:	this.attrs.x + me.json.size.width / 2,//220
			y:	this.attrs.y + me.json.size.height / 2//160
		};
	};

	onDragMove = function (dx, dy, x, y, event) {
		var me = this.data("this");

		var trans_x = dx - this.ox;
		var trans_y = dy - this.oy;
		this.translate(trans_x, trans_y);
		this.ox = dx;
		this.oy = dy;

		var posX = event.layerX || event.offsetX || event.x || event.clientX,
			posY = event.layerY || event.offsetY || event.y || event.clientY;

		for (var ndx = 0, tl = this.target.length; ndx < tl; ndx++) {
			if ((posX >= this.target[ndx].attrs.x) && (posX <= (this.target[ndx].attrs.x + this.target[ndx].attrs.width)) && (posY >= this.target[ndx].attrs.y) && (posY <= (this.target[ndx].attrs.y + this.target[ndx].attrs.height))) {
				this.target[ndx].attr({fill: '#8080ff', opacity: 1.0});
			} else {
				this.target[ndx].attr({fill: 'none'});
			}
		}
	};

	onDragUp = function (event) {
		var me = this.data("this");

		if (isEmpty(this.target)) return;

		var trans_x = this.attrs.x - this.ox;
		var trans_y = this.attrs.y - this.oy;
		this.translate(trans_x, trans_y);

		var posX = event.layerX || event.offsetX || event.x || event.clientX,
			posY = event.layerY || event.offsetY || event.y || event.clientY;

		for (var ndx = 0, tl = this.target.length; ndx < tl; ndx++) {
			if ((posX >= this.target[ndx].attrs.x) && (posX <= (this.target[ndx].attrs.x + this.target[ndx].attrs.width)) && (posY >= this.target[ndx].attrs.y) && (posY <= (this.target[ndx].attrs.y + this.target[ndx].attrs.height))) {
				var json = {
					id: me.json.id,
					target: me.json.targetRect[ndx].target,
					type: me.json.type,
					content: me.json.label,
					actualSize: me.json.actualSize
				};
				
				me.json.thisMain.setResource(json);

				if (!isEmpty(me.json.onDragUp)) me.json.onDragUp(json);
			}else{
				this.translate(-this.attrs.x,-this.attrs.y);
			}
		}

		//	remove the blue target areas...
		this.target.remove();
		this.target = null;
	};
	
	//	can we drag this item?
	if (this.json.draggable) {
		this.button.drag(onDragMove, onDragStart, onDragUp);
	}
};

view.Button.prototype.getBBox = function() {
	return this.button.getBBox();
};

view.Button.prototype.getButton = function() {
	return this.button;
};


