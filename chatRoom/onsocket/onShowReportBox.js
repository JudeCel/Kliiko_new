var onShowReportBox = function(result) {
	var dataAsJson = JSON.parse(result);

	window.reportbox.setReportbox(dataAsJson);

	socket.emit('getreport', window.sessionID, window.userID);
};
