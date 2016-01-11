var view = namespace('sf.ifs.View');

view.Reportbox = function(json) {
	this.type = "PDF";
	this.includeFacilitator = true;

	if (isEmpty(json)) json = {};
	if (!isEmpty(json.type)) this.type = json.type;

	this.reportbox = paperReportbox.set();

	this.json = {
		title: "Click on " + this.type + " icons to save report",
		button: "Done"
	};
	this.types = ["All Content", "Star Content Only", "Whiteboard"];

	this.canvasBorder = null;
	this.messageBorder = null;
	this.submitButton = null;
	this.lines = 0;
}

view.Reportbox.prototype.setReportbox = function(dataAsJson){
	this.topicList = dataAsJson;

	for (var ndx = 0, ntl = this.topicList.length; ndx < ntl; ndx++) {
		this.topicList[ndx].brand_project_name = this.topicList[ndx].brand_project_name.replace(/[^A-Za-z0-9 ]/g,'');
		this.topicList[ndx].sessionName = this.topicList[ndx].session_name.replace(/[^A-Za-z0-9 ]/g,'');
		this.topicList[ndx].name = this.topicList[ndx].name.replace(/[^A-Za-z0-9 ]/g,'');
	}
}

view.Reportbox.prototype.getTopicList = function() {
	return this.topicList;
}

view.Reportbox.prototype.getFormat = function() {
	return this.type;
}

view.Reportbox.prototype.setFormat = function(value) {
	if (isEmpty(value)) return;

	this.type = value;
}

view.Reportbox.prototype.generateReport = function(json) {
	json.type = window.reportbox.getFormat();
	json.includeFacilitator = window.reportbox.includeFacilitator;

	socket.emit('report', json);

	setTimeout(function() {
		window.dashboard.toBack();
	}, 0);

	setTimeout(function() {
		window.dashboard.showMessage({
			message: {
				text: "Generating your Report\n \nPlease Wait...",
				attr: {
					'font-size': 24,
					fill: "white"
				}
			},
			dismiss: {
				yes: {						//	check using window.dashboard.YES
					text:	"OK",
					attr: {
						'font-size': 24,
						fill: "white"
					}
				}
			},
			showClose: false,
			zIndex: 9
		}, function(value) {
			window.dashboard.toBack();		//	time to hide the dashboard
		});
	}, 0);
}

view.Reportbox.prototype.setReportValue = function(dataAsJson) {
	this.json.title = "Click on " + this.type + " icons to save report";

	this.html = '<div style="position:relative; left:0px; top:0px; width:0px; height: 00px;">' +
				'	<label style="position: absolute; left: 50px; top: 30px; width: 700px; font-size:30px; color: #fff;">' + this.json.title + '</label>' +
				'	<div style="position: absolute; left:80px; top:100px; width:546px; height: 20px;">' +
				'		<table id="reportbox-table-header" name="reportbox-table" border="0" cellspacing="0" style="position: absolute; left:0px; top: 0px; height: 20px; width: 450px; font-size:12px;">' +
				'			<tr>' +
				'				<td style="width: 200px; color: #fff">Topics</td> ' +
				'				<td style="width: 200px; color: #fff" align="center" colspan="2">Chat Room History</td> ' +
				'				<td style="width: 100px; color: #fff">Whiteboard</td> ' +
				'				<td style="width: 100px; color: #fff">Votes</td> ' +
				'			</tr>' +
				'			<tr>' +
				'				<td style="width: 200px; color: #fff"></td> ' +
				'				<td style="width: 100px; color: #fff">All</td> ' +
				'				<td style="width: 100px; color: #fff">Stars Only</td> ' +
				'				<td style="width: 100px; color: #fff"></td> ' +
				'				<td style="width: 100px; color: #fff"></td> ' +
				'			</tr>' +
				'		</table>' +
				'	</div>' +
				'	<div style="position: absolute; left:80px; top:130px; width:546px; height: 200px; overflow-x: hidden; overflow-y: auto;">' +
				'		<table id="reportbox-table" name="reportbox-table"  border="0" cellspacing="0" style="position: absolute; left:0px; top: 0px; height: 130px; width: 450px; font-size:12px;">';

	this.lines = this.topicList.length;

	var brandProject = null,
		sessionName = null;


	var json = null;
	for(var ndx = 0; ndx < this.lines; ndx++) {
		if (!brandProject) {
			brandProject = this.topicList[ndx].brand_project_name;
			sessionName = this.topicList[ndx].sessionName;
		}
		var dataString = JSON.stringify(dataAsJson[ndx]);
		dataString = dataString.replace(/"/g,"\'");

		this.html +=		'<tr>';

		//	column one - topic name
		this.html +=	'		<td style="width: 200px; color: #fff">' + this.topicList[ndx].name + '</td> ';



		//	column two - chat history - all
		json = '{' +
		'	sessionId: ' + window.sessionId + ', ' +
		'	userID: ' + window.userID + ', ' +
		'	topicID: ' + this.topicList[ndx].topicId + ', ' +
		'	report: {' +
		'		type: \'chat\', ' +
		'		brand: \'' + brandProject + '\', ' +
		'		session: \'' + sessionName + '\', ' +
		'		topic: \'' + this.topicList[ndx].name + '\'' +
		'	}' +
		'}';

		this.html +=	'		<td style="width: 100px;">' +
						'			<img src="' + window.URL_PATH + window.CHAT_ROOM_PATH + 'resources/images/' + this.type + '.png" onClick="view.Reportbox.prototype.generateReport(' + json + ')" width="20" height="20" alt="Generate Chat Room History Report";>' +
						'		</td>';

		//	column three - chat history - stars
		json = '{' +
		'	sessionId: ' + window.sessionId + ', ' +
		'	userID: ' + window.userID + ', ' +
		'	topicID: ' + this.topicList[ndx].topicId + ', ' +
		'	report: {' +
		'		type: \'chat_stars\', ' +
		'		brand: \'' + brandProject + '\', ' +
		'		session: \'' + sessionName + '\', ' +
		'		topic: \'' + this.topicList[ndx].name + '\'' +
		'	}' +
		'}';

		this.html += 	'		<td style="width: 100px;">' +
						'			<img src="' + window.URL_PATH + window.CHAT_ROOM_PATH + 'resources/images/' + this.type + '.png" onClick="view.Reportbox.prototype.generateReport(' + json + ')" width="20" height="20" alt="Generate Chat Room History Report";>' +
						'		</td>';

		//	column four - whiteboard
		json = '{' +
		'	sessionId: ' + window.sessionId + ', ' +
		'	userID: ' + window.userID + ', ' +
		'	topicID: ' + this.topicList[ndx].topicId + ', ' +
		'	report: {' +
		'		type: \'whiteboard\', ' +
		'		brand: \'' + brandProject + '\', ' +
		'		session: \'' + sessionName + '\', ' +
		'		topic: \'' + this.topicList[ndx].name + '\'' +
		'	}' +
		'}';

		var onclick = '',
			img = '	';
		if (this.type === 'PDF') {
			img = '		<img src="' + window.URL_PATH + window.CHAT_ROOM_PATH + 'resources/images/' + this.type + '.png" onClick="view.Reportbox.prototype.generateReport(' + json + ')" width="20" height="20" alt="Generate Chat Room History Report";>';
		}

		this.html +=	'		<td style="width: 100px;">' +
						img +
						'		</td>';

		//	column five - votes
		json = '{' +
		'	sessionId: ' + window.sessionId + ', ' +
		'	userID: ' + window.userID + ', ' +
		'	topicID: ' + this.topicList[ndx].topicId + ', ' +
		'	report: {' +
		'		type: \'vote\', ' +
		'		brand: \'' + brandProject + '\', ' +
		'		session: \'' + sessionName + '\', ' +
		'		topic: \'' + this.topicList[ndx].name + '\'' +
		'	}' +
		'}';

		this.html +=	'		<td style="width: 100px;">' +
						'			<img src="' + window.URL_PATH + window.CHAT_ROOM_PATH + 'resources/images/' + this.type + '.png" onClick="view.Reportbox.prototype.generateReport(' + json + ')" width="20" height="20" alt="Generate Chat Room History Report";>' +
						'		</td>';

		this.html +=	'	</tr>';
	}

	var checkedPDF = "",
		checkedCSV = "",
		checkedTXT = "",
		checkedIncludeFacilitator = "";

	switch (this.type) {
		case 'PDF':
			checkedPDF = "checked"
			break;
		case 'CSV':
			checkedCSV = "checked"
			break;
		case 'TXT':
			checkedTXT = "checked"
			break;
	}

	if (this.includeFacilitator) checkedIncludeFacilitator = "checked";

	this.html += '		</table>' +
				 '	</div>' +
				 '	<div style="position: absolute; left:80px; top:350px; width:546px; height: 40px;">' +
				 '		<table id="reportbox-summary-table" name="reportbox-summary-table"  border="0" cellspacing="0" style="position: absolute; left:0px; top: 0px; height: 130px; width: 450px; font-size:12px;">' +
				 '			<tr>' +
				 '				<td style="width: 200px; color: #fff">Chat Room Statistics</td> ';

				//	chat room statistics
				json = '{' +
				 '	sessionId: ' + window.sessionId + ', ' +
				 '	userID: ' + window.userID + ', ' +
				 '	topicID: 0, ' +
				 '	report: {' +
				 '		type: \'stats\', ' +
				 '		brand: \'' + brandProject + '\', ' +
				 '		session: \'' + sessionName + '\'' +
				 '	}' +
				 '}';

	this.html += '				<td style="width: 100px;">' +
				 '					<img src="' + window.URL_PATH + window.CHAT_ROOM_PATH + 'resources/images/' + this.type + '.png" onClick="view.Reportbox.prototype.generateReport(' + json + ')" width="20" height="20" alt="Generate Stats Report";>' +
				 '				</td>' +
				 '				<td style="width: 110px;"></td>' +
				 '				<td style="width: 110px;"></td>' +
				 '				<td style="width: 110px;"></td>' +
				 '			</tr>' +
				 '		</table>' +
				 '	</div>' +
				 '	<label style="position: absolute; left: 70px; top: 390px; font-size:16px; color: #fff;">PDF</label>' +
				 '	<label style="position: absolute; left: 170px; top: 390px; font-size:16px; color: #fff;">CSV</label>' +
				 '	<label style="position: absolute; left: 270px; top: 390px; font-size:16px; color: #fff;">TXT</label>' +
				 '  <input style="position: absolute; left: 50px; top: 390px;" type="radio" name="formatGroup" value="PDF" onchange="reportFormat(this)" ' + checkedPDF + '></input>' +
				 '  <input style="position: absolute; left: 150px; top: 390px;" type="radio" name="formatGroup" value="CSV" onchange="reportFormat(this)" ' + checkedCSV + '></input>' +
				 '  <input style="position: absolute; left: 250px; top: 390px;" type="radio" name="formatGroup" value="TXT" onchange="reportFormat(this)" ' + checkedTXT + '></input>' +
				 '	<label style="position: absolute; left: 480px; top: 405px; font-size:24px;" onclick="view.Reportbox.prototype.toBack()">' + this.json.button + '</label>' +
				 '	<label style="position: absolute; left: 70px; top: 420px; width: 500px; font-size:16px; color: #fff;">Include Facilitator Interaction</label>' +
				 '  <input style="position: absolute; left: 50px; top: 420px;" type="checkbox" name="cbIncludeFacilitator" value="IF" onchange="reportIncludeFacilitator(this)" ' + checkedIncludeFacilitator + '></input>' +
				 '</div>';
}

view.Reportbox.prototype.clearReportbox = function () {
	var item = null;
	if (!this.reportbox) return;

	while (this.reportbox.length > 0) {
		item = this.reportbox.pop();
		item.remove();
	}
}

view.Reportbox.prototype.toFront = function() {
	var divReportbox = document.getElementById("reportbox");

	//	moved here for now just for testing, should be the last thing done...
	divReportbox.style.zIndex = 4;

	this.clearReportbox();
	this.draw();
}

view.Reportbox.prototype.toBack = function() {
	var reportboxHTML = document.getElementById("reportbox-html");
	reportboxHTML.style.display = "none";

	var divReportbox = document.getElementById("reportbox");
	divReportbox.style.zIndex = -3;
	this.clearReportbox();
}

view.Reportbox.prototype.draw = function() {
	var canvasWidth = paperReportbox.canvas.clientWidth ? paperReportbox.canvas.clientWidth : paperReportbox.width,
		canvasHeight = paperReportbox.canvas.clientHeight ? paperReportbox.canvas.clientHeight : paperReportbox.height;

	var reportboxHTML = document.getElementById("reportbox-html");
	var reportboxInnerHTML = document.getElementById("reportbox-inner-html");
	reportboxInnerHTML.innerHTML = this.html;

	var areaRadius = 16;
	var canvasBorder = paperReportbox.path(getRoundedRectToPath(0, 0, (canvasWidth- 0), (canvasHeight - 0), areaRadius));
	canvasBorder.attr({fill: "#000", "fill-opacity": 0.5, stroke: "none", "stroke-width": 0, "stroke-opacity": 0});
	this.reportbox.push(canvasBorder);

	canvasWidth = paperReportboxHTML.canvas.clientWidth ? paperReportboxHTML.canvas.clientWidth : paperReportboxHTML.width;
	canvasHeight = paperReportboxHTML.canvas.clientHeight ? paperReportboxHTML.canvas.clientHeight : paperReportboxHTML.height;

	if (this.canvasBorder) {
		if (this.canvasBorder[0]) this.canvasBorder.remove();
	}
	this.canvasBorder = paperReportboxHTML.path(getRoundedRectToPath(5, 5, (canvasWidth - 8), (canvasHeight - 8), areaRadius));
	this.canvasBorder.attr({fill: MENU_BACKGROUND_COLOUR, stroke: MENU_BORDER_COLOUR, "stroke-width": 5, "stroke-opacity": 1, opacity: 0.8});
	this.reportbox.push(this.canvasBorder);

	if(this.messageBorder){
		if(this.messageBorder[0]) this.messageBorder.remove();
	}
	//this.messageBorder = paperReportboxHTML.path(getRoundedRectToPath(50, 80, 500, 40 + this.lines*30, 5));
	this.messageBorder = paperReportboxHTML.path(getRoundedRectToPath(50, 80, 543, 300, 5));
	this.messageBorder.attr({fill: "#304064", stroke: "#043a6b", "stroke-width": 2, "stroke-opacity": 1, opacity: 0.8});
	this.reportbox.push(this.messageBorder);

	if (this.submitButton) {
		if (this.submitButton[0]) this.submitButton.remove();
	}
	this.submitButton = paperReportboxHTML.path(getRoundedRectToPath(450, 400, 120, 40, (areaRadius / 2)));
	this.submitButton.attr({fill: "#a66500", stroke: "#ffc973", "stroke-width": 5, "stroke-opacity": 1, opacity: 0.5});
	this.reportbox.push(this.submitButton);

	this.submitButton.hover(
		function() {
			if (this.animate) {
				if (!this.removed) this.animate({"opacity": 0.9}, 500);
			}
		},
		function() {
			if (this.animate) {
				if (!this.removed) this.animate({"opacity": 0.5}, 500);
			}
		}
	);

	this.submitButton.click(function() {
		window.reportbox.toBack();
	});

	if (!isEmpty(reportboxHTML)) reportboxHTML.style.display = "block";
	if (!isEmpty(reportboxInnerHTML)) {
		reportboxInnerHTML.style.display = "block";
	}
}

view.Reportbox.prototype.close = function() {
	var path = getClosePath();

	var onClick = function() {
		window.reportbox.toBack();
	}

	var iconJSON = {
		x:			180 - (DEFAULT_ICON_RADIUS * 2),
		y:			95 - (DEFAULT_ICON_RADIUS * 2),
		click:		onClick,
		path:		path,
		thisMain:	window,
		paper:		paperReportbox
	}

	var close = new sf.ifs.View.Icon(iconJSON);
	close.draw();

	this.reportbox.push(close.getIcon());
}

view.Reportbox.prototype.push = function(object) {
	if (!isEmpty(this.reportbox)) {
		this.reportbox.push(object);
	}
};

//-----------------------------------------------------------------------------
function reportFormat(element) {
	var json = {
		type: element.value
	}

	//	lets redraw the report-box with the new format now...
	if (!isEmpty(window.reportbox)) {
		window.reportbox.setFormat(json.type);
		socket.emit('getreport', window.sessionId, window.userID);
	}
}

function reportIncludeFacilitator(element) {
	window.reportbox.includeFacilitator = element.checked;
}
