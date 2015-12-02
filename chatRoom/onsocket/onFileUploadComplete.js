/*
	json = {
		name: string,				//	name of the file (no path), e.g., "Daves_Budgie.jpg",
		type: string,				//	'image' | 'collage' | audio'
		userId: int,				//	user id
		topicId: int,				//	topic id
		format: string,				//	file type, e.g., 'JPEG' | 'PNG' | 'MP3' | 'ACC'
		width: int, 				//	image specific
		height: int,				//	image specific
		depth :int 					//	image specific
	}
*/
var onFileuploadcomplete = function(json) {
	console.log("fileupload");
	console.log(json);

	window.dashboard.toBack();		//	time to hide the dashboard

	switch (json.type) {
		case 'image': {
			socket.emit('getresources', window.sessionID, json.type, true);
		}
			break;
		case 'audio': {
			socket.emit('getresources', window.sessionID, json.type, true);
		}
			break;
		case 'collage': {
			//	lets update the picture board (for everyone)
			//if (!isEmpty(window.personalImageContent)) socket.emit('getpersonalimages', window.topicID, null);

			if (!isEmpty(window.topicID)) {
				var json = {
					type: 'pictureboard',
					updateEvent: true,			//	make sure we update everyone's picture boards
					content: 'none'				//	don't touch the console for this operation		
				}

				window.topic.getConsole().setConsole(json);
			}

		}
			break;
	}
};
