var onUsername = function(data) {
	//	used for a "quirk in IE before IE10, connections & disconnections are handled slightly differently
	//	at least using Node.js 0.6.8
	window.receivedUsername = true;

	//	make sure only the requestor gets the username...
	var json = JSON.parse(data);

	if (json.length == 0) {
        var dashboard = window.getDashboard();
        dashboard.showMessage({
			message: {
				text: "This user doesn't seem to exist.\n \nPlease contact your Facilitator.",
				attr: {
					'font-size': 24,
					fill: "white"
				}
			},
			dismiss: {
			},
			showClose: false,
			zIndex: 9
		}, function(value) {
            dashboard.toBack();		//	time to hide the dashboard
		});
	}

	if (json.length > 1) return;

	if (typeof json[0].username != "undefined") {
		thisMain.username = json[0].username;

		//	make sure we update the username on the server
		socket.emit('setusername', thisMain.username);

		//	lets make sure we have our participants list and topics
		socket.emit('getparticipants', sessionId);
		socket.emit('gettopics', sessionId);
	}
};
