var onSubmitform = function(formID) {
	document.forms[formID].submit();

	window.dashboard.toBack();	//	time to hide the dashboard
	window.dashboard.showMessage({
		message: {
			text: "Please Wait",
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
