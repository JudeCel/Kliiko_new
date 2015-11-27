var view = namespace('sf.ifs.View');

/*
	json = {
		x: int,
		y: int,
		title: string,				//	tooltip
		scale: float,
		attributes: {
			head: int,				//	various avatar parts
			face: int,
			hair: int,
			top: int,
			accessory: int,
			desk: int,
			colour: string,			//	colour of this avatar, in the form '#rrggbb' or '#rgb'
			name: string			//	first name of this Avatar
		},
		caption: string,			//	display this caption under the avatar (i.e. show which topic a participant is in)
		paper: pointer				//	pointer to the canvas we are drawing on
	}
*/
view.AvatarRenderer = function(json) {
	this.avatar = null;

	json.x = (!isEmpty(json.x)) ? json.x : 0;
	json.y = (!isEmpty(json.y)) ? json.y : 0;

	//	lets add our translation
	json.x = json.x + 15;
	json.y = json.y + 50;

	json.scale = (!isEmpty(json.scale)) ? json.scale : 1.0;

	if (!isEmpty(json.attributes)) {
		this.head = (!isEmpty(json.attributes.head)) ? json.attributes.head : 0;
		this.face = (!isEmpty(json.attributes.face)) ? json.attributes.face : 7	;			//	offline
		this.hair = (!isEmpty(json.attributes.hair)) ? json.attributes.hair : 0;
		this.top = (!isEmpty(json.attributes.top)) ? json.attributes.top : 0;
		this.accessory = (!isEmpty(json.attributes.accessory)) ? json.attributes.accessory : 0;
		this.desk = (!isEmpty(json.attributes.desk)) ? json.attributes.desk : 0;
		this.colour = (!isEmpty(json.attributes.colour)) ? json.attributes.colour : '#888888';	//	default to a boring middle of the range grey
		this.name = (!isEmpty(json.attributes.name)) ? json.attributes.name : 'untitled';
	} else {
		this.head = 0;
		this.face = 4;
		this.hair = 0;
		this.top = 0;
		this.accessory = 0;
		this.desk = 0;
		this.colour = '#888888';
		this.name = 'untitled';
	}

	if (!isEmpty(json.caption)) {
		this.caption = json.caption;
	} else {
		this.caption = "";
	}

	this.json = json;

	this.draw();
};

view.AvatarRenderer.prototype.getEmotion = function() {
	var result = 'offline';

	switch(this.face) {
		case 0:
			result = 'angry';
			break;		
		case 1:
			result = 'confused';
			break;		
		case 2:
			result = 'smiling';
			break;		
		case 3:
			result = 'love';
			break;		
		case 4:
			result = 'normal';
			break;		
		case 5:
			result = 'upset';
			break;		
		case 6:
			result = 'surprised';
			break;		
		case 7:
			result = 'offline';
			break;		
	}

	return result;
};

view.AvatarRenderer.prototype.setEmotion = function(emotion) {
	if (emotion){
		switch(emotion){
			case "angry":
				this.face = 0;
			break;
			case "confused":
				this.face = 1;
			break;
			case "smiling":
				this.face = 2;
			break;
			case "love":
				this.face = 3;
			break;
			case "normal":
				this.face = 4;
			break;
			case "upset":
				this.face = 5;
			break;
			case "surprised":
				this.face = 6;
			break;
			case "offline":
			case "sleep":
				this.face = 7;
			break;
			default: {
				this.face = 7;	//	sleep (offline)
			}
			break;
		}
	}
};

view.AvatarRenderer.prototype.setCaption = function(caption) {
	if (isEmpty(caption)) caption = "";

	this.caption = caption;
};

view.AvatarRenderer.prototype.draw = function() {
	if (this.avatar) {
		for (var ndxOuter = 0, nco = this.avatar.length; ndxOuter < nco; ndxOuter++) {
			switch (this.avatar[ndxOuter].type) {
				case "text": {
					if (!this.avatar[ndxOuter].removed) {
						this.avatar[ndxOuter].remove();
					}
				}
				break;
				case "set": {
					for (var ndxInner = 0, nci = this.avatar[ndxOuter].length; ndxInner < nci; ndxInner++) {
						if (this.avatar[ndxOuter][ndxInner]) {
							if (!this.avatar[ndxOuter][ndxInner].removed) {
								this.avatar[ndxOuter][ndxInner].remove();
							}
						}
					}
				}
				break;
			}
		}
	}

	this.avatar = this.json.paper.set();

	var transform = "t" + this.json.x + "," + this.json.y;
	
	var deskLabel = deskLabels[0](this.json.paper, this.colour);
	deskLabel.transform("t" + (this.json.x + 15) + "," + (this.json.y + 100));

	//	lets write our name on the label now
	var labelText = this.json.paper.text((this.json.x + 60), (this.json.y + 112), this.name).attr({'font-size': 10, fill: '#fff'});

	var head = heads[this.head](this.json.paper);
	head.transform(transform);
	
	var face = faces[this.face](this.json.paper);
	face.transform(transform);
	
	var hair = hairs[this.hair](this.json.paper);
	hair.transform(transform);
	
	var top = tops[this.top](this.json.paper);
	top.transform(transform);
	
	var accessory = accessories[this.accessory](this.json.paper);
	accessory.transform(transform);
	
	var desk = desks[this.desk](this.json.paper);
	desk.transform(transform);

	var caption = this.json.paper.text((this.json.x + 60), (this.json.y + 128), this.caption).attr({'font-size': 10, fill: '#000'});

	this.avatar.push(
		deskLabel,
		labelText,
		head,
		face,
		hair,
		top,
		accessory,
		desk,
		caption
	);

	if (!isEmpty(this.json.title)) {
		this.avatar.attr({title: this.json.title});
	}

	this.avatar.data("this", this);
	this.avatar.click(function() {
		var me = this.data("this");
		
		if (!isEmpty(me.json.clickEvent)) {
			switch (me.json.clickEvent.type) {
				case 'email': {
					// window.dashboard.toFront();
					// window.dashboard.setAvatarChooser();
					// window.dashboard.close();

					var link = "mailto:" + me.json.clickEvent.to
						/*
						+ "?cc="
						*/
						+ "?subject=" + escape(me.json.clickEvent.subject)
						+ "&body=" + escape(me.json.clickEvent.body);
					window.location.href = link;
				}
				break;
				case 'billboard': {
					window.chat.setMode('billboard');
				}
				break;
				// case 'avatarchooser': {
				// 	window.dashboard.setAvatarChooser();
				// 	window.dashboard.toFront();
				// 	window.dashboard.close();
				// }
			}
		}

		/*
		if (me.bubble) me.bubble.setToFront();
		me.avatar.toFront();
		me.emotion.emotion.toFront();
		if (me.label) {
			if (me.label[0]) me.label.toFront();
		}
		*/
	});
};

//----------------------------------------------------------------------------
view.AvatarRenderer.prototype.highlight = function() {
	// var avatarGlow = this.avatar.glow({
	// 	color: '#f00',
	// 	opacity: 0.0
	// });

	// avatarGlow.animate({opacity: 0.5}, 250, function() {
	// 	avatarGlow.animate({opacity: 0.0}, 250, function() {
	// 		avatarGlow.remove();
	// 	});
	// })

	var delay = 50,
		opacityStrong = 1.0
		opacityDim = 0.5;

	//	this is horrible, this should be a recurrsive thing, but hey...
	if (typeof this.avatar.animate != 'undefined') {
		if (!this.avatar.removed) this.avatar.animate({opacity: opacityDim}, delay, function() {
			this.animate({opacity: opacityStrong}, delay, function() {
				this.animate({opacity: opacityDim}, delay, function() {
					this.animate({opacity: opacityStrong}, delay, function() {
						this.animate({opacity: opacityDim}, delay, function() {
							this.animate({opacity: opacityStrong}, delay, function() {
								this.animate({opacity: opacityDim}, delay, function() {
									this.animate({opacity: opacityStrong}, delay, function() {
										this.animate({opacity: opacityDim}, delay, function() {
											this.animate({opacity: opacityStrong}, delay, function() {
												this.animate({opacity: opacityDim}, delay, function() {
													this.animate({opacity: opacityStrong}, delay, function() {
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		})
	}
};

//----------------------------------------------------------------------------
view.AvatarRenderer.prototype.setRawHead = function(value) {
	this.head = value;
};

view.AvatarRenderer.prototype.setRawFace = function(value) {
	this.face = value;
};

view.AvatarRenderer.prototype.setRawHair = function(value) {
	this.hair = value;
};

view.AvatarRenderer.prototype.setRawTop = function(value) {
	this.top = value;
};

view.AvatarRenderer.prototype.setRawAccessory = function(value) {
	this.accessory = value;
};

view.AvatarRenderer.prototype.setRawDesk = function(value) {
	this.desk = value;
};

