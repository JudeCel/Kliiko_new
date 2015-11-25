var consoleVideoHandler = function() {
	var embeddedData = decodeURI(topic.getConsole().consoleDocument);

	var consoleDocument = getIFrameFromYouTubeEmbeddedData(embeddedData);
				
	if (!isEmpty(consoleDocument)) {
		window.dashboard.setYouTubeHTML(consoleDocument);
		window.dashboard.toFront();
		window.dashboard.close();
	}				
}
