var onShowReportBox = function(result) {
	var dataAsJson = JSON.parse(result);

	window.reportbox.setReportbox(dataAsJson);

	socket.emit('getreport', window.sessionId, window.userID);
};
