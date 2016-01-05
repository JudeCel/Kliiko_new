var onUserinfo = function(data) {
	if (isEmpty(data)) return;

	window.receivedUsername = true;
	var userInfo = JSON.parse(data);
	if (!userInfo) {
        var dashboard = window.getDashboard();
        dashboard.showMessage({
			message: {
				text: "This user doesn't seem to be part\nof this session.\n \nPlease contact your Facilitator.",
				attr: {
					'font-size': 24,
					fill: "white"
				}
			},
			dismiss: {},
			showClose: false,
			zIndex: 9
		}, function(value) {
            dashboard.toBack();		//	time to hide the dashboard
		});
	} else {
		window.userInfo = userInfo;
		window.username = window.userInfo.username;

		//	make sure we update the username on the server
		socket.emit('setusername', thisMain.username);

		//	lets make sure we have our participants list and topics
		socket.emit('getparticipants', window.sessionId);
		//socket.emit('gettopics', window.sessionId); //moved in onParticipants.js, waiting for initialization window.topic
	}
};
