var view = namespace('sf.ifs.View');

view.Objects = function (json) {
	this.json = json;
	this.objects = new Array();

	this.undoStack = new Array();
	this.redoStack = new Array();
};

view.Objects.prototype.updateEvent = function (topicid, data) {
	//leave topic id here for future development according to topic id
	this.undoStack.push(data);
	this.redoStack.length = 0;
}

view.Objects.prototype.attachHandler = function (element, json) {
	if (isEmpty(json)) json = {
		move: true,
		remove: true
	};

	element.data("this", this);
	//element.g = null;

	// element.hover(
	// function () {
	// 	this.g = this.glow({
	// 		color: "#777777",
	// 		"opacity": 0.4
	// 	});
	// }, function () {
	// 	if(this.g != null){
	// 		this.g.remove();
	// 		this.g = null;
	// 	}
	// });

	onStart = function (x, y, event) {
		//	OK, lets initialise this move first
		this.dX = 0;
		this.dY = 0;

		// //	remove the glow
		// if(this.g != null){
		// 	this.g.remove();
		// 	this.g = null;
		// }
	};
	onMove = function (dx, dy, x, y, event) {
		//	remove the glow
		/*
		try {
			this.g.remove();
		} catch (e) {}*/

		// if(this.g != null){
		// 	this.g.remove();
		// 	this.g = null;
		// }

		var me = this.data("this");

		var move = " s" + me.json.scale + "," + me.json.scale + ", 0, 0 ";
			move = move + " t" + (this.message.transX + dx) + "," + (this.message.transY + dy);
		if (me.json.paint.attribute["pencilShape"] === "move") {
			this.transform(move);

			try{
				this.box.transform(move);
			} catch (e) {} 

			this.dX = dx;
			this.dY = dy;
		}
	};
	onUp = function (event) {
		//	remove the glow
		/*try {
			this.g.remove();
		} catch (e) {}*/

		// if(this.g != null){
		// 	this.g.remove();
		// 	this.g = null;
		// }

		var me = this.data("this");
		if (me.json.paint.attribute["pencilShape"] === "move") {
			this.message.action = "move";
			this.message.fromX = this.message.transX;
			this.message.fromY = this.message.transY;
			this.message.transX = this.message.transX + this.dX;
			this.message.transY = this.message.transY + this.dY;

			jsonMessage = {
				type: 'sendobject',
				message: this.message
			}
			me.json.thisMain.sendMessage(jsonMessage);
		}
	};

	if (json.move) {
		element.drag(onMove, onStart, onUp);
	}

	element.mousedown(function () {
		var me = this.data("this");
		/*try {
			this.g.remove();
		} catch (e) {}*/

		// if(this.g != null){
		// 	this.g.remove();
		// 	this.g = null;
		// }

		if (me.json.paint.attribute["pencilShape"] === "eraser") {
			if (!isEmpty(this.message)) {
				var message = this.message;
				message.action = "delete";

				jsonMessage = {
					type: 'sendobject',
					message: message
				}
				me.json.thisMain.sendMessage(jsonMessage);

				try {
					this.box.remove();
				} catch (e) {}

				this.remove();
			} else {
				if (!isEmpty(this.data("send_to_back"))) {
					if (this.data("send_to_back") === true) {
						this.remove();
						var json = {
							target: "whiteboard",
							type: "image",
							content: "delete"
						}

						thisMain.setResource(json);
						thisMain.shareResource(json);
					}
				}
			}
		}
	});
};


view.Objects.prototype.undoValid = function () {
	if (this.undoStack.length > 0) return true;
	else return false
};

view.Objects.prototype.redoValid = function () {
	if (this.redoStack.length > 0) return true;
	else return false;
};