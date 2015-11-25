var onAlreadyconnected = function() {
	//	make sure we know this happened
	window.alreadyConnected = true;

    var dashboard = window.getDashboard();
    dashboard.showMessage({
		message: {
			text: "You have already connected\nto the server",
			attr: {
				'font-size': 36,
				fill: "white"
			}
		},
		dismiss: {
		},
		showClose: false,
		zIndex: 8
	}, function(value) {
        dashboard.toBack();	//	time to hide the dashboard
	});
};
