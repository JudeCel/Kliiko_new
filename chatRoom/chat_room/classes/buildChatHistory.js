/*
	build.ChatHistory

	Basically this routine is designed to get the current chats from the
	IFS events table and update the chat history area within the IFS system.

	Creating this as it's own class allows us to optimise this as much 
	as we like without it touching the rest of the system.
*/
var build = namespace('sf.ifs.Build');

build.ChatHistory = function() {
	if (isEmpty(window.chatHistory)) return;	//	nothing to do if we haven't set up our chatHistory yet
	if (isEmpty(window.topic)) return;			//	we need this class up and running too

	//	lets get some chats
	window.socket.emit('getchats');

	//	lets get a list of all the avatars
	if (window.avatars === null) {
		window.avatars = window.topic.getAvatars();
	}

	this.updateAvatarsList = {};
	this.init();
}

build.ChatHistory.prototype.init = function() {
	for (var ndx = 0, la = window.avatars.length; ndx < la; ndx++) {
		//	don't update if offline
		if (window.avatars[ndx].emotion != "offline") {
			window.avatars[ndx].setEmotion('normal');

			this.updateAvatarsList[name] = 'normal';
		}
	}
}

//----------------------------------------------------------------------------
/*
	data = [{
		id: int,
		topic_id: int,
		userId: int,
		reply_id: int,
		cmd: string,
		thumbs_up,
		tag: int,						//	used to determine if a chat has been tagged, 0 no, 1 yes
		event: {						//	encodedURI JSON string
			name: string,
			object: {
				date: Date(),
				tag: int,				//	usually 0, for future use
				emotion: string,		//	"normal" | "angry" and so on
				input: string,			//	message,
				mode: {
					type: string,		//	'reply'
					replyTo: int,
					messageId: int
				}
			}
		},
		timestamp: int,
		created: string,		//	date format
		deleted: string,
		updated: string
	}, {...}]
*/
build.ChatHistory.prototype.processChatHistory = function(data) {
	//	make sure we have valid data
	if (isEmpty(data)) return;

	//data = decodeURI(data);
	data = JSON.parse(data);

	//	lets reset this
	window.lastBillboard = {
		message: null,
		event: null,
		name: null
	};
	//	basically we just need to iterate through 'data' and
	//	add a chat to the chat history
	var event = null;
	var nameIndex = {};
	var avatarInfo = null;
	var eventInfo = null;

	var billboardMode = false;
	for (var ndx = 0, ld = data.length; ndx < ld; ndx++) {
		event = JSON.parse(decodeURI(data[ndx].event));

		this.updateAvatarEmotion(event.name, event.object.emotion);

		if (isEmpty(nameIndex[data[ndx].userId])) {
			//var nameNdx = window.topic.getAvatarIndexByName(event.name);
            var nameNdx = window.topic.getAvatarIndexByUserId(data[ndx].userId);
			nameIndex[data[ndx].userId] = nameNdx;
		} else {
			nameNdx = nameIndex[data[ndx].userId];
		}

		if (isEmpty(nameNdx)) continue;

		avatarInfo = window.topic.getAvatarIndexByIndex(nameNdx);
		avatarInfo.avatarInfo = avatarInfo.avatar_info;
		avatarInfo.userId = avatarInfo.userId;

		if (!isEmpty(avatarInfo.colour)) {
			if (avatarInfo.colour[0] != '#') avatarInfo.colour = colourToHex(avatarInfo.colour);
		} else {
			avatarInfo.colour = "#000";			//	default
		}

		//	set up eventInfo now...
		eventInfo = {
			id: data[ndx].id,
			tag: data[ndx].tag,
			thumbs_up: data[ndx].thumbs_up,
			date: new Date(data[ndx].timestamp * 1000),
			emotion: event.object.emotion,
			input: event.object.input
		}

		//	reset the billboard mode each loop
		billboardMode = false;
		if (!isEmpty(event.object.mode)) {
			switch(event.object.mode.type) {
				case 'reply': {
					eventInfo.replyId = data[ndx].reply_id;
					eventInfo.replyUserId = event.object.mode.replyTo;
					eventInfo.replyDate = new Date(data[ndx].timestamp * 1000);
				}
				break;
				case 'billboard': {
					// TM: we should not place the topic's description into chat textinput
//					window.lastBillboard.message = event.object.input;
//					window.lastBillboard.event = event.object;
//					window.lastBillboard.name = event.name;
//					billboardMode = true;
				}
				break;
			}
		}

		if (!billboardMode) window.chatHistory.addChat(avatarInfo, eventInfo, nameNdx, false);
	}

	//	do we have a billboard message?
	if (!isEmpty(window.lastBillboard.event)) {
		//	is there anything to write on the whiteboard?
		var avatar = topic.getAvatarByName(window.lastBillboard.name);
		if (!isEmpty(avatar)) {
			avatar.say(window.lastBillboard.event, window.lastBillboard.event.date);
		}
	}

	this.drawAvatars();

	//	OK, this has finished...
	window.initFinished = window.initFinished + window.FINISHED_CHATHISTORY;

	if (window.initFinished === window.FINISHED_ALL) {
		window.playbackFinished();
	}
}

//----------------------------------------------------------------------------
build.ChatHistory.prototype.updateAvatarEmotion = function(name, emotion) {
	for (var ndx = 0, la = window.avatars.length; ndx < la; ndx++) {
		if (window.avatars[ndx].json.name === name) {
			//	don't update if offline
			if (window.avatars[ndx].emotion != "offline") {
				window.avatars[ndx].setEmotion(emotion);
				this.updateAvatarsList[name] = emotion;
			}

			break;
		}
	}

}

//----------------------------------------------------------------------------
build.ChatHistory.prototype.drawAvatars = function() {
	for (var ndx = 0, la = window.avatars.length; ndx < la; ndx++) {
		window.avatars[ndx].draw();
	}

	window.socket.emit('updateemotions', window.userID, window.topicID, this.updateAvatarsList);
}


