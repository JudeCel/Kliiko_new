var onInfo = function() {
	if (window.dashboard === null) {
		window.dashboard = new sf.ifs.View.Dashboard();		
	}

	window.dashboard.showMessage({
		message: {
			text: "Unable to start the Client\n \nI am unable to find any session information.\n \nTrying logging in again,\nif you still have problems, please contact IFS\n \nThank you",
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
		window.dashboard.toBack();		//	time to hide the dashboard
	});
};