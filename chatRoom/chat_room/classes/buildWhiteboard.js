/*
	build.Whiteboard

	Basically this routine is designed to get the current objects from
	the DB, but only the ones after the screen was last erased

	Creating this as it's own class allows us to optimise this as much 
	as we like without it touching the rest of the system.
*/
var build = namespace('sf.ifs.Build');

build.Whiteboard = function() {
	if (isEmpty(window.whiteboard)) return;
	//if (isEmpty(window.topic)) return;			//	we need this class up and running too

	//	lets get some chats
	window.socket.emit('getobjects');
}

/*
	data = [{
		id: int,
		topicId: int,
		userId: int,
		reply_id: int,
		cmd: string,
		tag: int,
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
build.Whiteboard.prototype.processWhiteboard = function(data) {
	var sendGetPersonalImages = window.sendGetPersonalImages;	//	we want to keep this as it might be
	var personalImageContent = window.personalImageContent;		//	destroyed in here by accident...

	//	make sure we have valid data
	if (!isEmpty(data)) {
		data = JSON.parse(data);

		//	basically we just need to iterate through 'data' and
		//	add a chat to the chat history
		var event = null;
		for (var ndx = 0, ld = data.length; ndx < ld; ndx++) {
			event = JSON.parse(decodeURI(data[ndx].event));

			switch(data[ndx].cmd) {
				case 'deleteall': 
				break;
				case 'shareresource': {
					window.setResourceDuringPlayback(event);
				}
				break;
				case 'object': {
					if (!isEmpty(window.whiteboard.updateCanvas)) {
						window.whiteboard.updateCanvas(event.name, event, true);
					}
				}
			}
		}

		//	OK, this has finished...
		//	firstly, lets put this value back (just in case)
		window.sendGetPersonalImages = sendGetPersonalImages;
		window.personalImageContent = personalImageContent;
	}


	//	has our playback finished yet?
	window.initFinished = window.initFinished + window.FINISHED_WHITEBOARD;

	if (window.initFinished === window.FINISHED_ALL) {
		window.playbackFinished();
	}
}