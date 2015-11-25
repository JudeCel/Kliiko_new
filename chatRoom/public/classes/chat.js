var view = namespace('sf.ifs.View');

/*
	json: {
		radius: float,
		marginTop: float,
		thisMain: pointer,		//	pointer to the "this" structure in topic.html
		paper: pointer			//	pointer to the canvas we are drawing on
	}
*/
view.Chat = function(json) {
	this.json = json;

	this.myChatBorder = null;
	this.myChatAvatarBackground = null;
	this.sendMessageButton = null;
	
	this.sendTo = null;
	this.chatHistoryIndex = null;
	this.sendToHistoryIndex = null;
	this.sendToColour = null;
	
	/*
		this.mode = {
			type: string,		//	"billboard" | "reply"
			replyTo: string,	//	(type = "reply"): name of user replying to
			messageId: int		//	(type = "reply"): message id of the message being replied too
		}
	*/
	this.mode = null;
};

view.Chat.prototype.clear = function() {
    this.mode = null;
    this.setBackgroundColour();
    document.getElementById("chatTextArea").value = "";
};

view.Chat.prototype.draw = function() {
	//	make sure we remove any old objects first

	if (this.myChatBorder) {
		if (this.myChatBorder[0]) this.myChatBorder.remove();
	}

	if (this.myChatAvatarBackground) {
		if (this.myChatAvatarBackground[0]) this.myChatAvatarBackground.remove();
	}

	if (!isEmpty(this.sendMessageButton)) {
		while (this.sendMessageButton.length > 0) {
			this.sendMessageButton.pop().remove();
		}
	}
	var chatWidth = this.json.paper.canvas.clientWidth ? this.json.paper.canvas.clientWidth : this.json.paper.width,
		chatHeight = this.json.paper.canvas.clientHeight ? this.json.paper.canvas.clientHeight : this.json.paper.height;

	this.myChatBorder = this.json.paper.path(getRoundedRectToPath(1, 1, chatWidth - 2, chatHeight - 2, this.json.radius)).attr({fill: "#efedec", stroke: "#e1ddda", "stroke-width": 2});
	this.myChatAvatarBackground = this.json.paper.path(getRoundedRectToPath((this.json.radius / 2), this.json.marginTop, 51, 36, (this.json.radius / 4))).attr({fill: "#fff", stroke: "#e1ddda", "stroke-width": 2});

	//	we also need the "Post" button
	var sendMessageButtonBackground = this.json.paper.path(getRoundedRectToPath(225, this.json.marginTop, 60, 36, 5)).attr({fill: "#95877f", stroke: "#e1ddda", "stroke-width": 2});
	var sendMessageButtonLabel = this.json.paper.text(255, (this.json.marginTop + 18), "Post").attr({'font-size': 16, fill: '#fff'});

	//	lets put these two together now
	this.sendMessageButton = this.json.paper.set();
	this.sendMessageButton.push(sendMessageButtonBackground, sendMessageButtonLabel);

	//	what happens if we click the button?
	this.sendMessageButton.data("this", this);
	this.sendMessageButton.data("sendMessageButtonBackground", sendMessageButtonBackground);
	this.sendMessageButton.click(function() {
		var me = this.data("this");
		var chatObject = document.getElementById("chatTextArea");
		var input = chatObject.value.trim();

        if(window.topicID == null){
            return;
        }

		if (input.length === 0) {
			me.mode = null;
			me.setBackgroundColour();	//	make sure we reset the colour back
			
			return;
		}

		chatObject.value = "";
		resetCaretPosition(chatObject);

        if(me.mode && me.mode.type == 'edit'){

            jsonMessage = {
                date: new Date().format("yyyy-mm-dd HH:MM:ss"),
                tag: me.mode.tag,
                emotion : me.json.thisMain.chatAvatar.getEmotion(),
                input : input,
                animate: true,
                topicId: window.topicID
            };

            socket.emit('editchat', me.mode.id, me.mode.tag, me.mode.user_id, jsonMessage);

        }else{

            jsonMessage = {
                date: new Date().format("yyyy-mm-dd HH:MM:ss"),
                tag: 0,
                emotion : me.json.thisMain.chatAvatar.getEmotion(),
                input : input,
                animate: true,
                topicId: window.topicID
            };

            if (me.sendTo != null) jsonMessage.to = me.sendTo;
            if (me.sendToHistoryIndex != null) jsonMessage.index = me.sendToHistoryIndex;
            if (me.sendToColour != null) jsonMessage.colour = me.sendToColour;
            if (me.mode != null) {
                jsonMessage.mode = me.mode;
                if (me.mode.replyTo != null && me.mode.messageId != null) {
                    socket.emit('insert_offline_transactions', me.mode.replyTo, me.mode.messageId)
                }
            }

            socket.emit('sendchat', jsonMessage);
        }



		me.json.thisMain.chatAvatar.setEmotion("normal");	//	lets reset this back to what to normal :-)
		
		me.mode = null;

		me.setBackgroundColour();
	});

	//	what happens if we hover over the button?
	this.sendMessageButton.hover(
		//	hover in
		function() {
			var sendMessageButtonBackground = this.data("sendMessageButtonBackground");
			sendMessageButtonBackground.attr({fill: "#a1ddda"});
		},
		//	hover out
		function() {
			var sendMessageButtonBackground = this.data("sendMessageButtonBackground");
			sendMessageButtonBackground.attr({fill: "#95877f"});
		}
	);
};

view.Chat.prototype.setBackgroundColour = function(colour) {
	if (isEmpty(colour)) colour = "#efedec";

	if (!isEmpty(this.myChatBorder)) {
		this.myChatBorder.attr({fill: colour});
	}
};

view.Chat.prototype.getMode = function() {
	if (isEmpty(this.mode)) return null;
	
	return this.mode.type;
};

view.Chat.prototype.setMode = function(mode, json) {
	var keepProcessing = true;

	var chatObject = document.getElementById("chatTextArea");
	var message = "";
	if (window.lastBillboard.message != null) {
		message = window.lastBillboard.message;
	}
	//var input = chatObject.value.trim();

	switch (mode) {
		case 'billboard': {
			var colour = "#efedec";
			if (!isEmpty(this.mode)) {
				//	turn billboard mode on or off?
				if (this.mode.type === 'billboard') {
					this.mode = null;
					colour = "#efedec";

					chatObject.value = "";

				} else {
					this.mode = {
						type: 'billboard'
					};
					colour = "#f9d2d8";
					chatObject.value = message;
				}
			} else {
				this.mode = {
					type: 'billboard'
				};
				colour = "#f9d2d8";
				chatObject.value = message;
			}
				
			this.setBackgroundColour(colour);
		}
		break;
		case 'reply': {
			if (!isEmpty(json)) {
				if (!isEmpty(this.mode)) {
					if (this.mode.tagId === json.tagId) {
						keepProcessing = false;

						this.mode = null;
						this.setBackgroundColour("#efedec");
					}
				}

				if (keepProcessing) {
					if (!isEmpty(json.replyTo)) {
						if (!isEmpty(json.messageId)) {
							this.mode = {
								tagId: json.tagId,
								type: 'reply',
								replyTo: json.replyTo,
								messageId: json.messageId
							};

							this.setBackgroundColour(json.colour);
						}
					}
				}
			}
		}
		break;
        case 'edit': {
            if (!isEmpty(json)) {
                if (!isEmpty(this.mode)) {
                    if (this.mode.tagId === json.id) {
                        keepProcessing = false;

                        this.mode = null;
                        this.setBackgroundColour("#efedec");
                    }
                }

                if (keepProcessing) {
                    if (!isEmpty(json.id)) {

                        this.mode = {
                            type: 'edit',
                            id: json.id,
                            user_id: json.user_id,
                            tag: json.tag
                        };

                        this.setBackgroundColour(json.colour);
                        chatObject.value = json.message;
                    }
                }
            }
        }
        break;
	}
};
