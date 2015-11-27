var view = namespace('sf.ifs.View');

/*
	json: {
		radius: float,
		marginTop: float,
		thisMain: pointer,		//	pointer to the "this" structure in topic.html
		paper: pointer			//	pointer to the canvas we are drawing on
	}
*/
view.Emoticons = function(json) {
	this.json = json;

	this.emoticonsWidth = (this.json.paper.canvas.clientWidth ? this.json.paper.canvas.clientWidth : this.json.paper.width) * 2;
	this.emoticonsHeight = (this.json.paper.canvas.clientHeight ? this.json.paper.canvas.clientHeight : this.json.paper.height) * 2;

	//	basically we want to drop the resolution by 2
	this.json.paper.setViewBox(0, 0, this.emoticonsWidth, this.emoticonsHeight, true);

	this.myEmoticonsBorder = null;

	this.scale = 1;
};

view.Emoticons.prototype.draw = function() {
	//	make sure we remove any old objects first

	if (this.myEmoticonsBorder) {
		if (this.myEmoticonsBorder[0]) this.myEmoticonsBorder.remove();
	}


	this.myEmoticonsBorder = this.json.paper.path(getRoundedRectToPath(1, 1, this.emoticonsWidth - 2, this.emoticonsHeight - 2, this.json.radius * 2)).attr({fill: "#efedec", stroke: "#e1ddda", "stroke-width": 2});

	this.emotions = new Array();

	var head = new Array();
	var face = new Array();
	var emotion = null;

	var headX = 0,
		headY = 12;

	var transformHead = null,
		transformFace = null;

	for (var ndx = 0; ndx < 7; ndx++) {
		switch(ndx) {
			case 0:
				emotion = "angry";
			break;
			case 1:
				emotion = "confused";
			break;
			case 2:
				emotion = "smiling";
			break;
			case 3:
				emotion = "love";
			break;
			case 4:
				emotion = "normal";
			break;
			case 5:
				emotion = "upset";
			break
			case 6:
				emotion = "surprised";
			break;
		}

		transformHead = "T" + headX + "," + headY + "S" + this.scale;
		transformFace = "T" + headX + "," + headY + "S" + this.scale;

		head[ndx] = heads[0](this.json.paper);
		head[ndx].transform(transformHead);

		face[ndx] = faces[ndx](this.json.paper);
		face[ndx].transform(transformFace);

		this.emotions[ndx] = this.json.paper.set();
		this.emotions[ndx].push(head[ndx]);
		this.emotions[ndx].push(face[ndx]);

		//this.emotions[ndx].transform(transform);
		//this.emotions[ndx].transform("...s" + this.scale);
		this.emotions[ndx].attr({opacity: 0.25, title: emotion.toUpperCaseFirstLetter()});

		this.emotions[ndx].data("this", this.emotions[ndx]);
		this.emotions[ndx].data("emotion", emotion);
		this.emotions[ndx].hover(
			//	hover in
			function() {
				var animationHoverIn = Raphael.animation({"opacity": 1.0}, 250);
				var me = this.data("this");

				me.animate(animationHoverIn.delay(0));
			},
			//	hover out
			function() {
				var animationHoverIn = Raphael.animation({"opacity": 0.25}, 250);
				var me = this.data("this");

				me.animate(animationHoverIn.delay(0));
			}
		);

		this.emotions[ndx].click(function() {
			var emotion = this.data("emotion");
			console.log(emotion);
			window.chatAvatar.setEmotion(emotion);
		});

		headX += 80;
	}
};
