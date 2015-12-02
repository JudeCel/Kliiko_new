var onTopicset = function(useSimpleWait) {
	if (isEmpty(useSimpleWait)) { useSimpleWait = false };

	dashboard = new sf.ifs.View.Dashboard();	//	lets create and draw our dashboard while things load...
	dashboard.toFront();

	if (useSimpleWait) {
		dashboard.waitSimple();
	} else {
		dashboard.wait();
	}

	window.initFinished = window.FINISHED_NONE;

	buildBillboard = new sf.ifs.Build.Billboard();
	buildChatHistory = new sf.ifs.Build.ChatHistory();
	buildWhiteboard = new sf.ifs.Build.Whiteboard();
	buildLastSharedResource = new sf.ifs.Build.LastSharedResource();

	//	lets Playback everything
	window.clearWhiteboard();
	window.clearChats();
};
