var view = namespace('sf.ifs.View');

//-----------------------------------------------------------------------------
view.Dashboard = function() {
	this.dashboard = paperDashboard.set();
	
	this.player = null;
	this.canvasBorder = null;
	this.titleArea = null;
	this.titleQuestion = null;
	this.votingStyle = null;
	this.infoArea = null;
	this.titleLabel = null;
	this.textArea = null;
	this.messageBorder = null;
	this.submitButton = null;
	this.submitButtonText = null;

	this.votingType = [];

	this.votingTypeCode = "YesNoUnsure";		//	default

	this.types = [ "Yes / No / Unsure",  "Star Rating (out of 5)"];//, "Yes / No", "Free Text"];
	this.typeCodes = [ "YesNoUnsure",  "StarRating"];//,"YesNo","FreeText"];

	this.voting = [];
	this.voting[this.typeCodes[0]] = ["Yes", "No", "Unsure"];
	this.voting[this.typeCodes[1]] = null;

	this.starRating = 0;	//	start with no stars
	this.star = [];

	this.voteQuestion = '<No Question>';
	this.voteAnswer = '<No Answer>';
	this.voteStyle = null,
	this.voteId = -1;
};

view.Dashboard.prototype.YES = 1,
view.Dashboard.prototype.NO = 0,
view.Dashboard.prototype.CANCEL = -1;

//-----------------------------------------------------------------------------
view.Dashboard.prototype.clearDashboard = function () {
	var item = null;

	while (this.dashboard.length > 0) {
		item = this.dashboard.pop();
		try {
			item.remove();
		} catch(e) {};
	}
};

//-----------------------------------------------------------------------------
view.Dashboard.prototype.toggle = function() {
	var divDashboard = document.getElementById("dashboard");
	divDashboard.style.zIndex = this.json.zIndex;
	if (divDashboard.style.zIndex < 0) {
		this.toFront();
	} else {
		this.toBack();
	}
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.toFront = function(zIndex) {
	if (isEmpty(zIndex)) zIndex = 3;

	var divDashboard = document.getElementById("dashboard");

	var dashboardInnerHTML = document.getElementById("dashboard-inner-html");
	// if (!isEmpty(dashboardInnerHTML)) {
	// 	dashboardInnerHTML.innerHTML = null;
	// }

	this.clearDashboard();
	this.draw();
	divDashboard.style.zIndex = zIndex;
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.toBack = function() {
	//	hide our div first
	var dashboardHTML = document.getElementById("dashboard-html");
	dashboardHTML.style.display = "none";

	var dashboardInnerHTML = document.getElementById("dashboard-inner-html");
	if (!isEmpty(dashboardInnerHTML)) {
		//dashboardInnerHTML.innerHTML = null;
	}

	var dashboardJPlayerVideoHTML = document.getElementById("dashboard-jplayer-video-html");
	dashboardJPlayerVideoHTML.innerHTML = null;
	dashboardJPlayerVideoHTML.style.display = "none";

	var dashboardJPlayerAudioHTML = document.getElementById("dashboard-jplayer-audio-html");
	dashboardJPlayerAudioHTML.style.display = "none";

	var divDashboard = document.getElementById("dashboard");

	divDashboard.style.zIndex = -3;
	this.clearDashboard();
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.draw = function() {
	var canvasWidth = paperDashboard.canvas.clientWidth ? paperDashboard.canvas.clientWidth : paperDashboard.width,
		canvasHeight = paperDashboard.canvas.clientHeight ? paperDashboard.canvas.clientHeight : paperDashboard.height;
				
	//	lets paint our dashboard
	var areaRadius = 16;
	var canvasBorder = paperDashboard.path(getRoundedRectToPath(0, 0, (canvasWidth- 0), (canvasHeight - 0), areaRadius));
	canvasBorder.attr({fill: "#000", "fill-opacity": 0.5, stroke: "none", "stroke-width": 0, "stroke-opacity": 0});
	this.dashboard.push(canvasBorder);
};

//-----------------------------------------------------------------------------
view.Dashboard.prototype.wait = function() {
	var canvasWidth = paperDashboard.canvas.clientWidth ? paperDashboard.canvas.clientWidth : paperDashboard.width,
		canvasHeight = paperDashboard.canvas.clientHeight ? paperDashboard.canvas.clientHeight : paperDashboard.height,
		titleY = 100,
		centerX = (canvasWidth / 2),
		centerY = (canvasHeight / 2),
		bodyX = 100,
		footerX = 20,
		footerY = 550;

	var title = "Please Wait";
	var body = "If this is taking a while... please upgrade your browser to one of the following:\n● Internet Explorer 9* or above\n● Chrome 19.n or above\n● Firefox 21.n or above\n● Safari 5.1.n or above\n● Android 4.1.n or above with default Chrome browser\n● iOS 6.n or above with default Safari browser\n \n* Internet Explorer 10 or above is preferred";
	var footer = "If your browser is the latest version, then our server might be temporarily running slower for maintenance.\nIf so, then it should soon be back to normal. Thanks for your patience.";
		
	//var spinner = paperDashboard.image(window.URL_PATH + window.CHAT_ROOM_PATH + "resources/ajax-loading-graphics/globe64.gif", centerX, centerY, 64, 64);
	var spinnerTitleShadow = paperDashboard.text(centerX + 2, titleY + 2, title).attr({
		'font-size':	36,
		fill:			"black"
		//'text-anchor':	"start" 
	});
	this.dashboard.push(spinnerTitleShadow);

	var spinnerTitle = paperDashboard.text(centerX, titleY, title).attr({
		'font-size':	36,
		fill:			"cyan"
		//'text-anchor':	"start" 
	});
	this.dashboard.push(spinnerTitle);

	var spinnerBodyShadow = paperDashboard.text(bodyX + 2, centerY + 2, body).attr({
		'font-size':	24,
		fill:			"black",
		'text-anchor':	"start" 
	});
	this.dashboard.push(spinnerBodyShadow);

	var spinnerBody = paperDashboard.text(bodyX, centerY, body).attr({
		'font-size':	24,
		fill:			"white",
		'text-anchor':	"start" 
	});
	this.dashboard.push(spinnerBody);

	var spinnerFooterShadow = paperDashboard.text(footerX + 2, footerY + 2, footer).attr({
		'font-size':	20,
		fill:			"black",
		'text-anchor':	"start" 
	});
	this.dashboard.push(spinnerFooterShadow);

	var spinnerFooter = paperDashboard.text(footerX,footerY, footer).attr({
		'font-size':	20,
		fill:			"white",
		'text-anchor':	"start" 
	});

	this.dashboard.push(spinnerFooter);
};

//-----------------------------------------------------------------------------
view.Dashboard.prototype.waitSimple = function() {
	var canvasWidth = paperDashboard.canvas.clientWidth ? paperDashboard.canvas.clientWidth : paperDashboard.width,
		canvasHeight = paperDashboard.canvas.clientHeight ? paperDashboard.canvas.clientHeight : paperDashboard.height,
		titleY = 100,
		centerX = (canvasWidth / 2),
		centerY = (canvasHeight / 2),
		bodyX = 100,
		footerX = 20,
		footerY = 550;

	var title = "Please Wait...";
	var body = "";
	var footer = "";
		
	//var spinner = paperDashboard.image(window.URL_PATH + window.CHAT_ROOM_PATH + "resources/ajax-loading-graphics/globe64.gif", centerX, centerY, 64, 64);
	var spinnerTitleShadow = paperDashboard.text(centerX + 2, titleY + 2, title).attr({
		'font-size':	36,
		fill:			"black"
		//'text-anchor':	"start" 
	});
	this.dashboard.push(spinnerTitleShadow);

	var spinnerTitle = paperDashboard.text(centerX, titleY, title).attr({
		'font-size':	36,
		fill:			"cyan"
		//'text-anchor':	"start" 
	});
	this.dashboard.push(spinnerTitle);

	var spinnerBodyShadow = paperDashboard.text(bodyX + 2, centerY + 2, body).attr({
		'font-size':	24,
		fill:			"black",
		'text-anchor':	"start" 
	});
	this.dashboard.push(spinnerBodyShadow);

	var spinnerBody = paperDashboard.text(bodyX, centerY, body).attr({
		'font-size':	24,
		fill:			"white",
		'text-anchor':	"start" 
	});
	this.dashboard.push(spinnerBody);

	var spinnerFooterShadow = paperDashboard.text(footerX + 2, footerY + 2, footer).attr({
		'font-size':	20,
		fill:			"black",
		'text-anchor':	"start" 
	});
	this.dashboard.push(spinnerFooterShadow);

	var spinnerFooter = paperDashboard.text(footerX,footerY, footer).attr({
		'font-size':	20,
		fill:			"white",
		'text-anchor':	"start" 
	});

	this.dashboard.push(spinnerFooter);
};

//-----------------------------------------------------------------------------
/*
	json = {
		type: string,						//	'image' | 'audio' | 'collage' | 'voteResult' | 'voteEdit' | 'voting' | 'avatachooser' | 'pickemotion'
		label: string,
		isPlaceHolder: boolean,				{required}
		placeHolderY: int,					{required}
		formID: string,						{required}
		titleID: string,					{required}
		textID: string,						
		isLocal: boolean
	}
*/
view.Dashboard.prototype.setBrowseText = function(json) {
	//	first, lets check to see if everything is here
	if (typeof json === "undefined") return;
	if (typeof json.placeHolderY === "undefined") return;
	if (typeof json.formID === "undefined") return;
	if (typeof json.titleID === "undefined") return;

	//	set up some defaults
	if (typeof json.label === "undefined") json.label = null;
	if (typeof json.isPlaceHolder === "undefined") json.isPlaceHolder = false;
	if (typeof json.isLocal === "undefined") json.isLocal = false;

	//if (isEmpty(text)) text = "Click here to browse for a file...";
	if (!isEmpty(json.label)) {
		if (this.textObject) {
			if (this.textObject[0]) this.textObject.remove();
		}

		var fontSize = 18;
		if (json.isLocal) {
			switch(getBrowser()) {
				case 'ie':
					fontSize = 14;
					json.label = json.label + " (Double-Click)";
				break;
				default:
				break;
			}
			this.textObject = paperDashboardHTML.text(310, json.placeHolderY, json.label);
			this.textObject.attr({'fill': "#000", 'font-size': fontSize});
		} else {
			this.textObject = paperDashboardHTML.text(310, json.placeHolderY, formatFilename(json.label, 24));
			this.textObject.attr({'fill': "#000", 'font-size': fontSize});
		}
	}

	if (json.isPlaceHolder) {
		if (!isEmpty(json.label)) {
			this.textObject.attr({opacity: 0.25});
		}
		this.submitButtonText.attr({opacity: 0.25});
		this.submitButton.click(function() {});
		this.submitButtonText.click(function() {}); 
	} else {
		if (!isEmpty(json.textID)) {
			var textField = document.getElementById(json.textID);
			//	make sure our text field (hidden) has the right value
			if (!isEmpty(json.label)) {
				this.textObject.attr({opacity: 1.0});

				textField.value = json.label;
			} else {
				textField.value = "";
			}
		}
		this.submitButtonText.attr({opacity: 1.0});
		//this.submitButtonText.unclick();

		var onClick = function() {
			me = this.data("this");

			var title = null;
			var text = {
				value: 'n/a'
			};

			if (!isEmpty(json.titleID)) {
				title = document.getElementById(json.titleID);
				
				if (isEmpty(title.value)) {
					title.style.background = '#ffcccc';
					
					return;
				} else {
					title.style.background = '#ffffff';
				}
			}

			if (!isEmpty(json.textID)) {
				text = document.getElementById(json.textID);
				
				if (isEmpty(text.value)) {
					text.style.background = '#ffcccc';
					
					return;
				} else {
					text.style.background = '#ffffff';
				}
			}

			//	OK, we have a title
			switch (json.type) {
				case "image":
				case "collage":
				case "audio": {
					window.socket.emit('settmptitle', window.userID, window.topicID, title.value, text.value, json.formID);	//	this returns with "submitform" (see onSubmitForm.js)
				}
				break;
				case "video": {
					var youTubeSharedLink = document.getElementById("taPasteYouTube");

					if (isEmpty(youTubeSharedLink.value)) {
						youTubeSharedLink.style.background = '#ffcccc';
						
						return;
					} else {
						youTubeSharedLink.style.background = '#ffffff';
					}

					var youTubeLink = processYouTubeData(youTubeSharedLink.value);

					if(youTubeLink == null){
						alert("You have input an invalid youTube link!/n Please re-enter.");
						return;
					}

					var youTubeSharedJSON = {
						title: title.value,
						//message: youTubeSharedLink.value
						message: youTubeLink
					}
					sf.ifs.View.VideoMenu.prototype.getYouTubeHTML(youTubeSharedJSON);
				}
				break;
				case "vote": {
					var voteQuestion = document.getElementById("IDUploadVoteQuestion");
					
					if (isEmpty(voteQuestion.value)) {
						voteQuestion.style.background = '#ffcccc';
						
						return;
					} else {
						voteQuestion.style.background = '#ffffff';
					}

					var voteJSON = {
						title: title.value,
						question: voteQuestion.value,
						style: me.votingTypeCode
					}
					sf.ifs.View.VoteMenu.prototype.getVoteHTML(voteJSON);
				}
				break;
				case "voteEdit": {
					var voteQuestion = document.getElementById("IDEditVoteQuestion");
					if (isEmpty(voteQuestion.value)) {
						voteQuestion.style.background = '#ffcccc';
						return;
					} else {
						voteQuestion.style.background = '#ffffff';
					}
					
					var voteID = document.getElementById("IDEditVote");
					var voteStyle = document.getElementById("IDEditVoteStyle");

					var voteJSON = {
						id: voteID.value,
						title: title.value,
						question: voteQuestion.value,
						style: voteStyle.value
					}
					sf.ifs.View.VoteMenu.prototype.getVoteEditHTML(voteJSON);
				}
				break;
				case "voting": {
					var style = me.voteStyle;
					var voteQuestion = document.getElementById("IDUploadVoteQuestion");

					var votingJSON = {
						id: me.voteId,
						question: me.voteQuestion,
						answer: me.voteAnswer,
						style: me.voteStyle
					};

					sf.ifs.View.Console.prototype.processForm(votingJSON);
				}
				break;
			}
		};

		this.submitButton.data("this", this);
		this.submitButtonText.data("this", this);

		this.submitButton.click(onClick);
		this.submitButtonText.click(onClick); 
	}

	if (!isEmpty(json.label)) {
		this.textObject.attr({'text-anchor': 'start'});	
	}
};
view.Dashboard.prototype.tidyUp = function(){
	function removeObject(obj) {
		if (obj) {
			if (obj.removed) return;
			if (obj[0]) {
				if (obj.stop) obj.stop();
				obj.remove();
			}
		}
	}
	
	try {
		removeObject(this.canvasBorder);
		removeObject(this.titleArea);
		removeObject(this.infoArea);
		removeObject(this.messageBorder);
		removeObject(this.titleLabel);
		removeObject(this.titleQuestion);
		removeObject(this.votingStyle);

		var ndx = 0;
		while (!isEmpty(this.votingType[ndx])) {
			removeObject(this.votingType[ndx].text);
			removeObject(this.votingType[ndx].shape);
			removeObject(this.votingType[ndx].count);

			ndx++;
		}

		ndx = 0;
		while(!isEmpty(this.star[ndx])) {
			if (this.star[ndx]) {
				if (!this.star[ndx].removed) {
					if (this.star[ndx].stop) this.star[ndx].stop();
					this.star[ndx].remove();
				}
			}
			ndx++;
		}

		removeObject(this.textArea);
		removeObject(this.submitButton);
		removeObject(this.submitButtonText);
		removeObject(this.textObject);
	} catch(e) {
	}
}


//-----------------------------------------------------------------------------
/*
	json = {
		type: string,						//	{required}	'image' | 'audio' | 'collage' | 'voteResult' | 'voteEdit' | 'voting' | 'avatachooser' | 'pickemotion'
		title: string,						//	{required}
		label: string,						//	{required}
		html: string,
		isPlaceHolder: boolean,				
		message: {
			text: string,
			height: int
		},
		formID: string,						//	{required}
		titleID: string,					//	{required}
		textID: string
	}
*/
view.Dashboard.prototype.setBrowseForResource = function(json) {
	var dashboardHTML = document.getElementById("dashboard-html");
	if (isEmpty(dashboardHTML)) return;

	//dashboardHTML.style.display = 'block';
	var dashboardInnerHTML = document.getElementById("dashboard-inner-html");
	if (isEmpty(dashboardInnerHTML)) return;

	//	make sure our json is valid
	if (isEmpty(json)) return;
	if (isEmpty(json.type)) return;

	//	this can be null if the style is "StarRating" for instance...
	// if (isEmpty(json.titleID)) return;
	// if (isEmpty(json.label)) return;
	// if (isEmpty(json.formID)) return;

	//	set up defaults
	if (isEmpty(json.html)) json.html = null;
	if (isEmpty(json.isPlaceHolder)) json.isPlaceHolder = false;

	var browser = getBrowser();
	var chatAreaRadius = 16;
	var canvasWidth = paperDashboardHTML.canvas.clientWidth ? paperDashboardHTML.canvas.clientWidth : paperDashboardHTML.width,
		canvasHeight = paperDashboardHTML.canvas.clientHeight ? paperDashboardHTML.canvas.clientHeight : paperDashboardHTML.height,
		canvasCenterX = (canvasWidth / 2),
		canvasCenterY = (canvasHeight / 2);
		

	this.tidyUp();

	//if (!isEmpty(json.html)) {
		dashboardInnerHTML.innerHTML = json.html;
	//}
					
	//	lets add a border
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.canvasBorder = paperDashboardHTML.path(getRoundedRectToPath(5, 5, (canvasWidth - 8), (canvasHeight - 8), chatAreaRadius));
	this.canvasBorder.attr({fill: MENU_BACKGROUND_COLOUR, stroke: MENU_BORDER_COLOUR, "stroke-width": 5, "stroke-opacity": 1, opacity: 0.8});
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	if (!isEmpty(json.title)) {
		this.titleArea = paperDashboardHTML.text(30, yy(30, browser), json.title);
		this.titleArea.attr({'fill': "#000"});
		this.titleArea.attr({'font-size': 36});
		this.titleArea.attr({'text-anchor': 'start'});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	if (!isEmpty(json.message)) {
		this.messageBorder = paperDashboardHTML.path(getRoundedRectToPath(20, 75, 600, json.message.height, 5));
		this.messageBorder.attr({fill: "#304064", stroke: "#043a6b", "stroke-width": 2, "stroke-opacity": 1, opacity: 0.8});

		var message = json.message.text;
						
		this.infoArea = paperDashboardHTML.text(30, yy(50, browser), message);
		this.infoArea.attr({'fill': "#cee"});
		this.infoArea.attr({'font-size': 18});
		this.infoArea.attr({'text-anchor': 'start'});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	if (!isEmpty(json.title)) {
		var titleY = 103.5;
		switch (json.type) {
			case "image":
			case "audio":
			case "collage":
				titleY = 163.5;
			break;
		}

		switch (json.type) {
			case "voteResult":
				var title = "Current Vote Result";
				titleY = 128;

				this.titleLabel = paperDashboardHTML.text(30, yy(titleY, browser), title);
				this.titleLabel.attr({'fill': "#000"});
				this.titleLabel.attr({'font-size': 24});
				this.titleLabel.attr({'text-anchor': 'start'});
			break;

			case "voting":
				//	voting doesn't need a title, but we can use this for
				//		Free Text
				var title = null;

				if (json.style === "StarRating"){
					title = "Please Rate (1 to 5 Stars):";
				}

				if (title != null) {
					titleY = 128;

					this.titleLabel = paperDashboardHTML.text(30, yy(titleY, browser), title);
					this.titleLabel.attr({'fill': "#000"});
					this.titleLabel.attr({'font-size': 24});
					this.titleLabel.attr({'text-anchor': 'start'});
				}
			break;

			case 'avatarchooser':
			case 'pickemotion':
			break;

			default:
				this.titleLabel = paperDashboardHTML.text(20, yy(titleY, browser), "Title:");
				this.titleLabel.attr({'fill': "#000"});
				this.titleLabel.attr({'font-size': 24});
				this.titleLabel.attr({'text-anchor': 'start'});
			break;
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	switch(json.type){
	case "vote":
	case "voting":
	case "voteResult":
	case "voteEdit":
		var circleX = 160;
		switch (json.type) {
			//	we don't need the following section for voting...
			case "vote": {
				this.types = ["Yes / No / Unsure", "Star Rating (out of 5)"];//,"Yes / No", "Free Text"];
				var yNdx = (titleY + 34);
				var radius = 7.5;
						
				this.titleQuestion = paperDashboardHTML.text(20, yy(titleY + 17, browser), "Question:");
				this.titleQuestion.attr({'fill': "#000", 'font-size': 24, 'text-anchor': 'start'});
						
				this.votingStyle = paperDashboardHTML.text(20, yy(titleY + 34, browser), "Voting Style:");
				this.votingStyle.attr({'fill': "#000", 'font-size': 24, 'text-anchor': 'start'});

				if (this.types) {
					for (var ndx = 0, tl = this.types.length; ndx < tl; ndx++) {										
						this.votingType[ndx] = {
							text: paperDashboardHTML.text((circleX + 30), yy(yNdx, browser), this.types[ndx]),
							shape: paperDashboardHTML.circle((circleX + (radius * 2)), (yNdx * 2) - radius, 10)
						}
								
						//	set up the attributes of our text and radio control
						this.votingType[ndx].text.attr({'fill': "#000", 'font-size': 18, 'text-anchor': 'start'});
						this.votingType[ndx].shape.attr({fill: "#054a7b", stroke: "#043a6b", "stroke-width": 2.5, "stroke-opacity": 1, "fill-opacity": 0});

						this.votingType[ndx].shape.data("this", this);
								
						//	do we have a callback for click?
						this.votingType[ndx].shape.click(function() {
							me = this.data("this");

							for (var ndxx = 0; ndxx < me.votingType.length; ndxx++) {
								if (this.id == me.votingType[ndxx].shape.id) {
									me.votingType[ndxx].shape.attr({"fill-opacity":1});

									me.votingTypeCode = me.typeCodes[ndxx];
								} else {
									me.votingType[ndxx].shape.attr({"fill-opacity": 0});
								}
							}
						});
											
						//	what happens if we hover over the button?
						this.votingType[ndx].shape.hover(
							//	hover in
							function() {
								if (this.aminate) {
									var animationHoverIn = Raphael.animation({stroke: BUTTON_BACKGROUND_COLOUR}, 500);

									if (!this.removed) this.animate(animationHoverIn.delay(0));
								}
							},
							//	hover out
							function() {
								if (this.animate) {
									var animationHoverOut = Raphael.animation({stroke: "#043a6b"}, 500);
														
									if (!this.removed) this.animate(animationHoverOut.delay(0));
								}
							}
						);
						yNdx = (yNdx + 17);
					}
				}
			}
			break;
			case "voteEdit": {
				this.types = ["Yes / No / Unsure", "Star Rating (out of 5)"];//,"Yes / No", "Free Text"];
				var yNdx = (titleY + 34);
				var radius = 7.5;
	
				this.titleQuestion = paperDashboardHTML.text(20, yy(titleY + 17, browser), "Question:");
				this.titleQuestion.attr({'fill': "#000", 'font-size': 24, 'text-anchor': 'start'});
						
				this.votingStyle = paperDashboardHTML.text(20, yy(titleY + 34, browser), "Voting Style:");
				this.votingStyle.attr({'fill': "#000", 'font-size': 24, 'text-anchor': 'start'});
			}
			break;
			case "voteResult":{
				switch(json.style) {
					case "StarRating": 
						circleX = 30; 
						var yNdx = (titleY + 17),
							syNdx = 270;

						var radius = 7.5;
						var starCount = 0;
					
						for (var ndx = 0, tl = json.voteStatus.length; ndx < tl; ndx++) {
							//Text for voter's name
							this.votingType[ndx] = {
								text: paperDashboardHTML.text(circleX, yy(yNdx, browser), json.voteStatus[ndx][0])
							}
							this.votingType[ndx].text.attr({'fill': "#000", 'font-size': 18, 'text-anchor': 'start'});

							for(var nndx=0, sl=json.voteStatus[ndx][1]; nndx < sl; nndx++){
								this.star[starCount] = paperDashboardHTML.path(getFilledStarPath).attr({fill: "#f8bf0b", stroke: "#f89f0b", "stroke-width": 2, "fill-opacity": 1});
								this.star[starCount].transform("t" + (circleX + 80 + nndx * 30) + "," + syNdx);
								starCount++;
							}


							if(ndx==3){
								yNdx = (titleY + 17);
								syNdx = 270;
								circleX += 300;
							}else{
								yNdx = (yNdx + 17);	
								syNdx += 33;
							}
						}

						break;
					case "YesNoUnsure":
						circleX = 30; 
						var yNdx = (titleY + 17);
						var radius = 7.5;

						for (var ndx = 0, tl = json.voteStatus.length; ndx < tl; ndx++) {
							this.votingType[ndx] = {
								text: paperDashboardHTML.text(circleX, yy(yNdx, browser), json.voteStatus[ndx][0]),
								shape: paperDashboardHTML.text(circleX + 120, yy(yNdx, browser), json.voteStatus[ndx][1])
							}
							//	set up the attributes of our text first
							this.votingType[ndx].text.attr({'fill': "#000", 'font-size': 18, 'text-anchor': 'start'});
							this.votingType[ndx].shape.attr({'fill': "#000", 'font-size': 18, 'text-anchor': 'start'});

							if (ndx === 3){
								yNdx = (titleY + 17);
								circleX += 300;
							}else{
								yNdx = (yNdx + 17);	
							}
						}
						break;
				}
			}
			break;
			case "voting": {
				switch (json.style) {
					case "StarRating": {
						title = "Please Rate (1 to 5 Stars):";

						//	code to create the stars...
						var x = 35;
						var y = 280;
						this.voteAnswer = this.starRating;
						this.star = [];
						for (var ndx = 0; ndx < 5; ndx++) {
							if (ndx < this.starRating)
								this.star[ndx] = paperDashboardHTML.path(getFilledStarPath).attr({fill: "#f8bf0b", stroke: "#f89f0b", "stroke-width": 2, "fill-opacity": 1.0});
							else
								this.star[ndx] = paperDashboardHTML.path(getFilledStarPath).attr({fill: "#f8bf0b", stroke: "#f89f0b", "stroke-width": 2, "fill-opacity": 0.1});

							this.star[ndx].transform("t" + x + "," + y +"s2");

							this.star[ndx].data("this", {
								index: (ndx + 1),
								me: this
							});
							this.star[ndx].click(function() {
								me = this.data("this");

								me.me.starRating = me.index;
								me.me.voteAnswer = me.index;
								for (var ndx = 0; ndx < 5; ndx++) {
									if (ndx < me.me.starRating)
										me.me.star[ndx].attr({fill: "#f8bf0b", stroke: "#f89f0b", "stroke-width": 2, "fill-opacity": 1.0});
									else
										me.me.star[ndx].attr({fill: "#f8bf0b", stroke: "#f89f0b", "stroke-width": 2, "fill-opacity": 0.1});
								}
							});

							//	what happens if we hover over a star?
							this.star[ndx].hover(
								//	hover in
								function() {
									if (this.animate) {
										var animationHoverIn = Raphael.animation({opacity: 0.5}, 250);

										if (!this.removed) this.animate(animationHoverIn.delay(0));
									}
								},
								//	hover out
								function() {
									if (this.animate) {
										var animationHoverOut = Raphael.animation({opacity: 1.0}, 250);
												
										if (!this.removed) this.animate(animationHoverOut.delay(0));
									}
								}
							);

							x = (x + 60);
						}
					}
					break;
					default: {
						//	code to create the radio buttons
						this.types = this.voting[json.style];
						this.votingTypeCode = json.style;
						circleX = 30; 
						var yNdx = (titleY + 34);
						var radius = 7.5;
						if (this.types) {
							for (var ndx = 0, tl = this.types.length; ndx < tl; ndx++) {
								this.votingType[ndx] = {
									text: paperDashboardHTML.text((circleX + 30), yy(yNdx, browser), this.types[ndx]),
									shape: paperDashboardHTML.circle((circleX + (radius * 2)), (yNdx * 2) - radius, 10)
								}

								//	set up the attributes of our text first
								this.votingType[ndx].text.attr({'fill': "#000"});
								this.votingType[ndx].text.attr({'font-size': 18});
								this.votingType[ndx].text.attr({'text-anchor': 'start'});

								//	set up the attribtes of our radio controls now
								this.votingType[ndx].shape.attr({fill: "#054a7b"});
								this.votingType[ndx].shape.attr({stroke: "#043a6b"});
								this.votingType[ndx].shape.attr({"stroke-width": 2.5});
								this.votingType[ndx].shape.attr({"stroke-opacity": 1});

								this.votingType[ndx].shape.attr({"fill-opacity": 0});

								this.votingType[ndx].shape.data("this", this);
								//	do we have a callback for click?
								this.votingType[ndx].shape.click(function() {
									me = this.data("this");

									for (var ndxx = 0; ndxx < me.votingType.length; ndxx++) {
										if (this.id == me.votingType[ndxx].shape.id) {
											me.votingType[ndxx].shape.attr({"fill-opacity":1});

											me.voteAnswer = me.types[ndxx];
										} else {
											me.votingType[ndxx].shape.attr({"fill-opacity": 0});
										}
									}
								});

								//	what happens if we hover over the button?
								this.votingType[ndx].shape.hover(
									//	hover in
									function() {
										if (this.animate) {
											var animationHoverIn = Raphael.animation({stroke: BUTTON_BACKGROUND_COLOUR}, 500);

											if (!this.removed) this.animate(animationHoverIn.delay(0));
										}
									},
									//	hover out
									function() {
										if (this.animate) {
											var animationHoverOut = Raphael.animation({stroke: "#043a6b"}, 500);
													
											if (!this.removed) this.animate(animationHoverOut.delay(0));
										}
									}
								);


								yNdx = (yNdx + 17);
							}
						}
					}
					break;
				}
			}
			break;
		}
	}
	
	if (!isEmpty(json.label)) {
		this.textArea = paperDashboardHTML.path(getRoundedRectToPath(300, 300, 320, 40, (chatAreaRadius / 2)));
		this.textArea.attr({fill: BUTTON_BACKGROUND_COLOUR, stroke: BUTTON_BORDER_COLOUR, "stroke-width": 5, "stroke-opacity": 1, opacity: 0.8});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	switch (json.type) {
		case 'avatarchooser':
		case 'pickemotion':
		case 'voteResult':
		break;

		default: {
			this.submitButton = paperDashboardHTML.path(getRoundedRectToPath(500, 360 + 55, 120, 40, (chatAreaRadius / 2)));
			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			//	lets attach any appropriate events
			switch (json.type) {
/*				case 'collage': {
					//uploadImage(json.extra);
					var form = document.getElementById(json.extra.formID);
					form.target = json.extra.iFrameID;
				}
*/			}

			this.submitButton.attr({fill: BUTTON_BACKGROUND_COLOUR, stroke: BUTTON_BORDER_COLOUR, "stroke-width": 5, "stroke-opacity": 1, opacity: 0.5});

			//	what happens if we hover over the button?
			this.submitButton.data("this", this.submitButton);
			this.submitButton.hover(
				//	hover in
				function() {
					if (this.animate) {
						var animationHoverIn = Raphael.animation({"opacity": 0.9}, 500);
						if (!this.removed) this.animate(animationHoverIn.delay(0));
					}
				},
				//	hover out
				function() {
					if (this.animate) {
						var animationHoverOut = Raphael.animation({"opacity": 0.5}, 500);
						if (!this.removed) this.animate(animationHoverOut.delay(0));
					}
				}
			);
			
			var submitTitle = "Add";
			var submitTitleX = 520;
			switch (json.type) {
				case "image":
				case "audio":
					submitTitle = "Upload";
				break;
				case "voting":
					submitTitleX = 533;
					switch (json.style) {
						case "StarRating":
							submitTitle = "Rate";
						break;
						case "YesNoUnsure":
							submitTitle = "Vote";
						break;
					}
				break;
				case "voteEdit":
					submitTitleX = 533;
					submitTitle = "Edit";
				break;
			}
			this.submitButtonText = paperDashboardHTML.text(submitTitleX, yy(194 + 27, browser), submitTitle);
			this.submitButtonText.attr({'fill': "#000"});
			this.submitButtonText.attr({'font-size': 24});
			this.submitButtonText.attr({'text-anchor': 'start'});
			this.submitButtonText.attr({opacity: 0.25});
			
			this.submitButtonText.data("this", this.submitButton);

			this.submitButtonText.hover(
				//	hover in
				function() {
					var me = this.data("this");

					if (me.animate) {
						var animationHoverIn = Raphael.animation({"opacity": 0.9}, 500);
						if (!me.removed) me.animate(animationHoverIn.delay(0));
					}
				},
				//	hover out
				function() {
					var me = this.data("this");

					if (me.animate) {
						var animationHoverOut = Raphael.animation({"opacity": 0.5}, 500);
						if (!me.removed) me.animate(animationHoverOut.delay(0));
					}
				}
			);

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
			var placeHolderY = yy(163.5, browser);
			switch (json.type) {
				case "image":
				case "audio":
					json.isPlaceHolder = true;
				break;
			}
				
			resourceJSON = {
				type: json.type,
				label: json.label,
				isPlaceHolder: json.isPlaceHolder,
				placeHolderY: placeHolderY,
				formID: json.formID,
				titleID: json.titleID,
				isLocal: true
			}

			if (!isEmpty(json.textID)) resourceJSON.textID = json.textID;
			this.setBrowseText(resourceJSON);
		}
		break;
	}	

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	dashboardHTML.style.display = "block";
	dashboardInnerHTML.style.display = "block";
			
	// if(json.type!="voteResult"){
	// 	dashboardInnerHTML.innerHTML = json.html;
	// }

}


//-----------------------------------------------------------------------------
view.Dashboard.prototype.onlyParticipants = function() {
	
}

//-----------------------------------------------------------------------------
/*
    json = {
        formID: string,                 //  id of the <form> tag
        titleID: string,             	//  id of the forms title <input> tag
        textID: string					//	id of the forms text <input> tag (hidden)
    }
*/
view.Dashboard.prototype.setBrowseForImage = function(html, json) {
	if (isEmpty(html)) return;
	if (isEmpty(json)) return;
    if (isEmpty(json.formID)) return;
    if (isEmpty(json.titleID)) return;
    if (isEmpty(json.textID)) return;

	var message =	"Only images of 2048K (2MB) or smaller in size will be uploaded.\n" +
					"You may need to crop or resize your image before trying to import it.\n" + 
					"The following image formats are supported\n" +
					"● JPG / JPEG\n" +
					"● GIF\n" +
					"● PNG";

	var label = "Browse for an Image";

	var resourceJSON = {
		type: "collage",
		title: "Upload an Image",
		label: label,
		isPlaceHolder: true,
		html: html,
		message: {
			text: message,
			height: 165
		},
		formID: json.formID,
		titleID: json.titleID,
		textID: json.textID
	}

	this.setBrowseForResource(resourceJSON);
}


//-----------------------------------------------------------------------------
/*
    json = {
        formID: string,                 //  id of the <form> tag
        titleID: string,             	//  id of the forms title <input> tag
        textID: string					//	{not used}
    }
*/
view.Dashboard.prototype.setBrowseForImageResource = function(html, json) {
	if (isEmpty(html)) return;
	if (isEmpty(json)) return;
    if (isEmpty(json.formID)) return;
    if (isEmpty(json.titleID)) return;
    if (isEmpty(json.textID)) return;

	var message =	"Only images of 2048K (2MB) or smaller in size will be uploaded.\n" +
					"You may need to crop or resize your image before trying to import it.\n" + 
					"The following image formats are supported\n" +
					"● JPG / JPEG\n" +
					"● GIF\n" +
					"● PNG";

	var label = "Browse for an Image";

	var resourceJSON = {
		type: "image",
		title: "Upload an Image Resource",
		label: label,
		html: html,
		message: {
			text: message,
			height: 165
		},
		formID: json.formID,
		titleID: json.titleID,
		textID: json.textID
	}

	this.setBrowseForResource(resourceJSON);
}

//-----------------------------------------------------------------------------
/*
    json = {
        formID: string,                 //  id of the <form> tag
        titleID: string,             	//  id of the forms title <input> tag
        textID: string					//	id of the forms text <input> tag (hidden)
    }
*/
view.Dashboard.prototype.setBrowseForAudioResource = function(html, json) {
	if (isEmpty(html)) return;
	if (isEmpty(json)) return;
    if (isEmpty(json.formID)) return;
    if (isEmpty(json.titleID)) return;
    if (isEmpty(json.textID)) return;

	var message =	"Only audio files of 2048K (2MB) or smaller in size will be uploaded.\n" +
					"You may need to crop or resample your audio file at a lower\n" + 
					"bit rate before trying to import it.\n" +
					"The following audio formats are supported\n" +
					"● MP3\n";

	var label = "Browse for an Audio file";

	var resourceJSON = {
		type: "audio",
		title: "Upload an Audio file",
		label: label,
		html: html,
		message: {
			text: message,
			height: 135
		},
		// titleID: "IDUploadAudioTitle",
		// formID: "formUploadAudio",
		formID: json.formID,
		titleID: json.titleID,
		textID: json.textID
	}

	this.setBrowseForResource(resourceJSON);
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.setVideoHTML = function(html) {
	if (isEmpty(html)) return;

	var message =	"Paste the embedded link details from youTube into the text area\n" +
					"below and then 'Add' it.\n" +
					"Don't forget to add a Title as well.\n";

	var json = {
		type: "video",
		title: "Adding a youTube video",
		label: null,
		html: html,
		message: {
			text: message,
			height: 80
		},
		titleID: "IDUploadVideoTitle",
		formID: null
	}

	this.setBrowseForResource(json);
}

//-----------------------------------------------------------------------------
//	this is used when the facilitator wants to create a form...
view.Dashboard.prototype.setVoteHTML = function(html) {
	if (isEmpty(html)) return;

	var message =	"Enter a title and question followed by the type of voting form you'd\n" +
					"like to create.\n";

	var json = {
		type: "vote",
		title: "Adding a Voting Form",
		label: null,
		html: html,
		message: {
			text: message,
			height: 72
		},
		titleID: "IDUploadVoteTitle",
		formID: null
	}

	this.setBrowseForResource(json);
}
//------------------------------------------------------------------------
view.Dashboard.prototype.setVoteEditHTML = function(html) {
	if (isEmpty(html)) return;

	var message =	"Edit the title and question followed you'd like to change.\n" +
					"The type of voting form is not changeable.\n";

	var json = {
		type: "voteEdit",
		title: "Editing a voting form",
		label: null,
		html: html,
		message: {
			text: message,
			height: 72
		},
		titleID: "IDEditVoteTitle",
		formID: null
	}

	this.setBrowseForResource(json);
}
//-----------------------------------------------------------------------------
//	this routine is used when a participant wants to vote...
//	json = {
//		id: 		int,		{default: -1}
//		title: 		string,
//		question:	string,
//		style:		string,		"YesNo" | "YesNoUnsure" | "FreeText" | "StarRating"
//		html:		string
//	}
view.Dashboard.prototype.setVoteJSON = function(json) {
	if (isEmpty(json)) return;
	if (isEmpty(json.title)) return;
	if (isEmpty(json.question)) return;
	if (isEmpty(json.style)) return;
	//if (isEmpty(json.html)) return;

	//	defaults
	if (isEmpty(json.id)) json.id = -1;

	//	trim our question first
	var question = json.question.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

	//	lets set up our globals for voting...
	this.voteQuestion = question;
	this.voteAnswer = '<No Answer>';
	this.voteStyle = json.style;
	this.voteId = json.id;

	if (question.charAt(question.length - 1) != '?') question = question + '?';

	var voteJSON = {
		type: "voting",
		style: json.style,
		title: json.title,
		label: null,
		html: json.html,
		message: {
			text: question,
			height: 135
		},
		titleID: null,
		formID: null
	}

	this.setBrowseForResource(voteJSON);
}
//vote result json
view.Dashboard.prototype.setVoteResultJSON = function(json) {
	if (isEmpty(json)) return;
	if (isEmpty(json.title)) return;
	if (isEmpty(json.question)) return;
	if (isEmpty(json.style)) return;
	//if (isEmpty(json.html)) return;

	//	trim our question first
	var question = json.question.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

	//	lets set up our globals for voting...
	this.voteQuestion = question;
	this.voteAnswer = '<No Answer>';
	this.voteStyle = json.style;
	if(json.id){
		this.voteId = json.id;
	}
	else{
		this.voteId = -1;
	}
	if (question.charAt(question.length-1) != '?') question = question + '?';

	var voteJSON = {
		type: "voteResult",
		style: json.style,
		title: json.title,
		label: null,
		html: json.html,
		message: {
			text: question,
			height: 135
		},
		voteStatus: json.voteStatus,
		titleID: null,
		formID: null
	}

	this.setBrowseForResource(voteJSON);
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.setAvatarChooser = function(html) {
	if (isEmpty(html)) {
		html = 	'<div id="dashboard-avatarChooser" style="layer-background-color:#003366; z-index: 3; position: absolute; left: 120px; top: 100px; width: 400px; height: 265px; margin: 0" >' +
				'</div>';
	}

	var json = {
		type: "avatarchooser",
		title: "Modify your Avatar",
		html: html
	}

	this.setBrowseForResource(json);

	var json = {
		userId: window.userID,
		sessionId: window.sessionId,
		radius: 15,
		injectInto: 'dashboard-avatarChooser'
	}

	var chooser = new sf.ifs.View.AvatarChooser(json);

}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.setEmotion = function(html) {
	if (isEmpty(html)) {
		html = 	'<div id="dashboard-avatarChooser" style="layer-background-color:#003366; z-index: 3; position: absolute; left: 120px; top: 100px; width: 400px; height: 265px; margin: 0" >' +
				'</div>';
	}

	var json = {
		type: "pickemotion",
		title: "Pick an Emotion",
		html: html
	}

	this.setBrowseForResource(json);

	var json = {
		userId: window.userID,
		radius: 15,
		injectInto: 'dashboard-avatarChooser'
	}

	var chooser = new sf.ifs.View.AvatarEmotionChooser(json);
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.setHTML = function(html) {
	if (isEmpty(html)) return;

	var dashboardHTML = document.getElementById("dashboard-html");
	dashboardHTML.style.display = "block";
	dashboardHTML.style.background = '#ffffff';
	
	dashboardHTML.innerHTML = html;
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.setFramedHTML = function(html) {
	if (isEmpty(html)) return;

	var browser = getBrowser();
	var chatAreaRadius = 16;
	var canvasWidth = paperDashboardHTML.canvas.clientWidth ? paperDashboardHTML.canvas.clientWidth : paperDashboardHTML.width,
		canvasHeight = paperDashboardHTML.canvas.clientHeight ? paperDashboardHTML.canvas.clientHeight : paperDashboardHTML.height,
		canvasCenterX = (canvasWidth / 2),
		canvasCenterY = (canvasHeight / 2);
		
	//	lets add a boarder
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	if (this.canvasBorder) {
		if (this.canvasBorder[0]) this.canvasBorder.remove();
	}
	this.canvasBorder = paperDashboardHTML.path(getRoundedRectToPath(5, 5, (canvasWidth - 8), (canvasHeight - 8), chatAreaRadius));
	this.canvasBorder.attr({fill: MENU_BACKGROUND_COLOUR, stroke: "#043a6b", "stroke-width": 5, "stroke-opacity": 1, opacity: 0.8});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var dashboardHTML = document.getElementById("dashboard-html");
	var dashboardInnerHTML = document.getElementById("dashboard-inner-html");

	if (!isEmpty(dashboardHTML)) dashboardHTML.style.display = "block";
	if (!isEmpty(dashboardInnerHTML)) {
		dashboardInnerHTML.style.display = "block";

		dashboardInnerHTML.innerHTML = html;
	}
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.setYouTubeHTML = function(html) {
	if (isEmpty(html)) return;

	var dashboardHTML = document.getElementById("dashboard-jplayer-video-html");
	dashboardHTML.style.display = "block";
	
	dashboardHTML.innerHTML = html;

	//function onYouTubePlayerAPIReady() {
	//	this.player = new YT.Player('player');
	//}
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.videoPlayerToFront = function() {
	var dashboardJPlayerHTML = document.getElementById("dashboard-jplayer-video-html");
	dashboardJPlayerHTML.style.display = "block";
	
	this.toFront();
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.audioPlayerToFront = function() {
	var dashboardJPlayerHTML = document.getElementById("dashboard-jplayer-audio-html");
	dashboardJPlayerHTML.style.display = "block";
	
	this.toFront();
}

//-----------------------------------------------------------------------------
/*
	json = {
		position: {
			x: int,
			y: int,
			radius: int 		//	{default: 16}
		},
		message: {
			text: string,		//	text to display for the button
			attr: object 		//	{optional} see Raphaël attr
		},
		callback: function, 	//	{default: null} function to call when the button is clicked
		value: int,		 		//	{default: 0} when the button is clicked, what value to return via the callback
		paper: object			//	where to draw our button
	}
*/
view.Dashboard.prototype.addButton = function(json) {
	//	lets make sure we have a message to display
	if (isEmpty(json)) return;
	if (isEmpty(json.paper)) return;
	if (isEmpty(json.position.x)) return;
	if (isEmpty(json.position.y)) return;
	if (isEmpty(json.message)) return;
	if (isEmpty(json.message.text)) return;

	//	lets set up some defaults...
	if (isEmpty(json.position.radius)) json.position.radius = 16;
	if (isEmpty(json.callback)) json.callback = function() {};	//	defaults to an empty function
	if (isEmpty(json.value)) json.value = 0;					//	set our default value

	//	first, lets draw our text
	var text = json.paper.text(json.position.x, json.position.y, json.message.text);
	if (!isEmpty(json.message.attr)) text.attr(json.message.attr);

	var textBBox = text.getBBox();

	//	OK, lets define where the button goes
	/*
		/--------\		so basically, we will leave the text at (json.position.x, json.position.y)
		|        |		but we will put the button around it.  The margin will be json.position.radius
		|  TEXT  |
		|        |
		\--------/
	*/

	var buttonAttributes = {};
	buttonAttributes.x = json.position.x - (textBBox.width / 2) - json.position.radius;
	buttonAttributes.y = json.position.y - (textBBox.height / 2) - json.position.radius;
	buttonAttributes.width = textBBox.width + (2 * json.position.radius);
	buttonAttributes.height = textBBox.height + (2 * json.position.radius);

	var button = json.paper.path(getRoundedRectToPath(buttonAttributes.x, buttonAttributes.y, buttonAttributes.width, buttonAttributes.height, json.position.radius));
	button.attr({fill: BUTTON_BACKGROUND_COLOUR, stroke: BUTTON_BORDER_COLOUR, "stroke-width": 5, "stroke-opacity": 1, opacity: 0.5});

	text.toFront();	//	make sure the text is in front of the button

	//	what happens if we hover over the button?
	text.data("callback", json.callback);
	text.data("value", json.value);

	button.data("callback", json.callback);
	button.data("value", json.value);

	text.data("button", button);

	//	lets make sure the button highlights, even when we hove over the text...
	text.hover(
		//	hover in
		function() {
			var button = this.data("button");

			if (button.animate) {
				var animationHoverIn = Raphael.animation({"opacity": 0.9}, 500);
				if (!button.removed) button.animate(animationHoverIn.delay(0));
			} 
		},
		//	hover out
		function() {
			var button = this.data("button");

			if (button.animate) {
				var animationHoverOut = Raphael.animation({"opacity": 0.5}, 500);
				if (!button.removed) button.animate(animationHoverOut.delay(0));
			} 
		}
	);

	button.hover(
		//	hover in
		function() {
			if (this.animate) {
				var animationHoverIn = Raphael.animation({"opacity": 0.9}, 500);
				if (!this.removed) this.animate(animationHoverIn.delay(0));
			}
		},
		//	hover out
		function() {
			if (this.animate) {
				var animationHoverOut = Raphael.animation({"opacity": 0.5}, 500);
				if (!this.removed) this.animate(animationHoverOut.delay(0));
			}
		}
	);

	//	what happens if we click this button?
	// button.click(function() {
	// 	callback = this.data("callback");
	// 	value = this.data("value");
		
	// 	callback(value);
	// });

	var onClick = function() {
		callback = this.data("callback");
		value = this.data("value");
		
		callback(value);
	};

	button.click(onClick);
	text.click(onClick);

	return json.paper.set().push(
		text,
		button
	);
}

//-----------------------------------------------------------------------------
/*
	json = {
		message: {
			text: string,		//	text to display for the main message
			attr: object 		//	see Raphaël attr
		},
		dismiss: {				//	{optional}
			yes: {
				text: string,		//	text on 'yes' button, ie. "Yes" | "OK" | "Sure" and so on
				attr: object 		//	see Raphaël attr
			},
			no: {
				text: string,		//	text on 'no' button, ie. "No" | "Not Now" and so on
				attr: object 		//	see Raphaël attr
			},
			cancel: {
				text: string,		//	text on the 'cancel' button, ie. "Cancel" | "Leave" | "Go Back" and so on...
				attr: object 		//	see Raphaël attr
			}
		},
		showClose: boolean,			//	{default: true}
		zIndex: int					//	{default: 3}
	}
*/
view.Dashboard.prototype.showMessage = function(json, callback) {
	//	lets make sure we have a message to display
	if (isEmpty(json)) return;
	if (isEmpty(json.message)) return;
	if (isEmpty(json.message.text)) return;

	//	set up some defaults
	if (isEmpty(json.showClose)) json.showClose = true;
	if (isEmpty(json.zIndex)) json.zIndex = 3;

	//	default the callback to an empty function
	if (isEmpty(callback)) callback = function() {};

	this.clearDashboard();

	this.toFront(json.zIndex);

	var canvasWidthHTML = paperDashboardHTML.canvas.clientWidth ? paperDashboardHTML.canvas.clientWidth : paperDashboardHTML.width,
		canvasHeightHTML = paperDashboardHTML.canvas.clientHeight ? paperDashboardHTML.canvas.clientHeight : paperDashboardHTML.height;

	var canvasWidth = paperDashboard.canvas.clientWidth ? paperDashboard.canvas.clientWidth : paperDashboard.width,
		canvasHeight = paperDashboard.canvas.clientHeight ? paperDashboard.canvas.clientHeight : paperDashboard.height,
		centerX = (canvasWidth / 2),
		centerY = (canvasHeight / 2),
		oneQuarterX = (centerX / 2),
		threeQuartersX = (centerX + oneQuarterX),
		oneThirdX = (canvasWidth / 3),
		twoThirdsX = (oneThirdX * 2),
		oneThirdY = (canvasHeight / 3),
		twoThirdsY = (oneThirdY * 2);		//	this is starting to feel like Bootstrap spans :-)
		
	//	lets add a border
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.canvasBorder = paperDashboard.path(getRoundedRectToPath(180, 95, (canvasWidthHTML - 8), (canvasHeightHTML - 8), 16));
	this.canvasBorder.attr({
		fill: MENU_BACKGROUND_COLOUR, 
		stroke: MENU_BORDER_COLOUR, 
		"stroke-width": 5, 
		"stroke-opacity": 1, 
		opacity: 0.8
	});

	this.dashboard.push(this.canvasBorder);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var messageShadow = paperDashboard.text((centerX + 1), (oneThirdY + 1), json.message.text);
	var message = paperDashboard.text(centerX, oneThirdY, json.message.text);

	if (!isEmpty(json.message.attr)) {
		messageShadow.attr(json.message.attr);	//	make sure the shadow has the same attributes
	}

	messageShadow.attr({fill: '#000'});			//	make sure the shadow is black


	if (!isEmpty(json.message.attr)) {
		message.attr(json.message.attr);
	}

	this.dashboard.push(messageShadow);
	this.dashboard.push(message);


	var numberOfButtons = 0,
		buttonFlag = 0;

	if (!isEmpty(json.dismiss)) {
		if (!isEmpty(json.dismiss.yes)) {
			if (!isEmpty(json.dismiss.yes.text)) {
				numberOfButtons = numberOfButtons + 1;
				buttonFlag = buttonFlag + 1;
			}
		}

		if (!isEmpty(json.dismiss.no)) {
			if (!isEmpty(json.dismiss.no.text)) {
				numberOfButtons = numberOfButtons + 1;
				buttonFlag = buttonFlag + 2;
			}
		}

		if (!isEmpty(json.dismiss.cancel)) {
			if (!isEmpty(json.dismiss.cancel.text)) {
				numberOfButtons = numberOfButtons + 1;
				buttonFlag = buttonFlag + 4;
			}
		}
	}

	//	default them
	var buttonYesX = centerX,
		buttonNoX = centerX,
		buttonCancelX = centerX;

	switch (numberOfButtons) {
		case 1: {
			buttonYesX = centerX;
			buttonNoX = centerX;
			buttonCancelX = centerX;
		}
			break;
		case 2: {
			if (buttonFlag & 1) {	//	is the YES button set?
				buttonYesX = twoThirdsX;
				buttonNoX = oneThirdX;
				buttonCancelX = oneThirdX;
			} else {
				buttonNoX = twoThirdX;
				buttonCancelX = oneThirdX;
			}
		}
			break;
		case 3: {
			buttonYesX = threeQuartersX;
			buttonNoX = centerX;
			buttonCancelX = oneQuarterX;
		}
			break;
	}

	if (!isEmpty(json.dismiss)) {
		//	[	Yes	]
		if (!isEmpty(json.dismiss.yes)) {
			if (!isEmpty(json.dismiss.yes.text)) {
				var buttonYes = this.addButton({
					position: {
						x: buttonYesX,
						y: twoThirdsY,
						radius: 8 	
					},
					message: {
						text: json.dismiss.yes.text,
						attr: json.dismiss.yes.attr || {}
					},
					callback: function(value) {
						callback(value);
					}, 
					value: this.YES,		 	
					paper: paperDashboard		
				});

				this.dashboard.push(buttonYes);
			}
		}
		//	[	No	]
		if (!isEmpty(json.dismiss.no)) {
			if (!isEmpty(json.dismiss.no.text)) {
				var buttonNo = this.addButton({
					position: {
						x: buttonNoX,
						y: twoThirdsY,
						radius: 8 	
					},
					message: {
						text: json.dismiss.no.text,
						attr: json.dismiss.no.attr || {}
					},
					callback: function(value) {
						callback(value);
					}, 
					value: this.NO,		 	
					paper: paperDashboard		
				});

				this.dashboard.push(buttonNo);
			}
		}
		//	[	Cancel	]
		if (!isEmpty(json.dismiss.cancel)) {
			if (!isEmpty(json.dismiss.cancel.text)) {
				var buttonCancel = this.addButton({
					position: {
						x: buttonCancelX,
						y: twoThirdsY,
						radius: 8 	
					},
					message: {
						text: json.dismiss.cancel.text,
						attr: json.dismiss.cancel.attr || {}
					},
					callback: function(value) {
						callback(value);
					}, 
					value: this.CANCEL,		 	
					paper: paperDashboard		
				});

				this.dashboard.push(buttonCancel);
			}
		}
	}

	//	lets show the close button
	if (json.showClose) {
		this.close();
	}
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.close = function() {
	var path = getClosePath();
	
	var onClick = function() {
		var player = window.dashboard.player;
		if (!isEmpty(player)) {
			player.stopVideo();
		}

		window.dashboard.toBack();
	}

	var iconJSON = {
		x:			180 - (DEFAULT_ICON_RADIUS * 2),
		y:			95 - (DEFAULT_ICON_RADIUS * 2),
		click:		onClick,
		path:		path,
		thisMain:	window,
		paper:		paperDashboard
	}
	
	var close = new sf.ifs.View.Icon(iconJSON);
	close.draw();

	this.dashboard.push(close.getIcon());
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.videoClose = function() {
	var path = getClosePath();
	
	var onVideoClick = function() {
        $("#jquery_jplayer_video").jPlayer("stop");

		window.dashboard.toBack();
	}

	var iconJSON = {
		x:			180 - (DEFAULT_ICON_RADIUS * 2),
		y:			95 - (DEFAULT_ICON_RADIUS * 2),
		click:		onVideoClick,
		path:		path,
		thisMain:	window,
		paper:		paperDashboard
	}
	
	var close = new sf.ifs.View.Icon(iconJSON);
	close.draw();

	this.dashboard.push(close.getIcon());
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.audioClose = function() {
	var path = getClosePath();
	
	var onAudioClick = function() {
        $("#jquery_jplayer_audio").jPlayer("stop");

		window.dashboard.toBack();
	}

	var iconJSON = {
		x:			285 - (DEFAULT_ICON_RADIUS * 2),
		y:			275 - (DEFAULT_ICON_RADIUS * 2),
		click:		onAudioClick,
		path:		path,
		thisMain:	window,
		paper:		paperDashboard
	}
	
	var close = new sf.ifs.View.Icon(iconJSON);
	close.draw();

	this.dashboard.push(close.getIcon());
}

/*
	json = {
		saveAs: string,				//	actual path the the report in the filesystem
		urlPath: string				//	URL to the report
	}

	showDashboard : boolean			//	{default : true}	do we need to bring to dashboard to front?
*/
view.Dashboard.prototype.report = function(json, showDashboard) {
	if (isEmpty(json)) return;
	if (isEmpty(json.urlPath)) return;

	if (isEmpty(showDashboard)) showDashboard = true;

	//	first we need to display our dashboard
	if (showDashboard) {
		this.clearDashboard();
		this.toFront(9999);
	}

	//	lets draw our dialogue
	var canvasWidthHTML = paperDashboardHTML.canvas.clientWidth ? paperDashboardHTML.canvas.clientWidth : paperDashboardHTML.width,
		canvasHeightHTML = paperDashboardHTML.canvas.clientHeight ? paperDashboardHTML.canvas.clientHeight : paperDashboardHTML.height;

	var canvasWidth = paperDashboard.canvas.clientWidth ? paperDashboard.canvas.clientWidth : paperDashboard.width,
		canvasHeight = paperDashboard.canvas.clientHeight ? paperDashboard.canvas.clientHeight : paperDashboard.height,
		centerX = (canvasWidth / 2),
		centerY = (canvasHeight / 2),
		oneQuarterX = (centerX / 2),
		threeQuartersX = (centerX + oneQuarterX),
		oneThirdX = (canvasWidth / 3),
		twoThirdsX = (oneThirdX * 2),
		oneThirdY = (canvasHeight / 3),
		twoThirdsY = (oneThirdY * 2);		//	this is starting to feel like Bootstrap spans :-)
		
	//	lets add a border
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.canvasBorder = paperDashboard.path(getRoundedRectToPath(180, 95, (canvasWidthHTML - 8), (canvasHeightHTML - 8), 16));
	this.canvasBorder.attr({fill: MENU_BACKGROUND_COLOUR, stroke: MENU_BORDER_COLOUR, "stroke-width": 5, "stroke-opacity": 1, opacity: 0.8});

	this.dashboard.push(this.canvasBorder);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var titleText = "Your Report is Ready...";
	var titleAttr = {
		'font-size': 24,
		fill: "white"
	}

	var messageShadow = paperDashboard.text((centerX + 1), (oneThirdY + 1), titleText);
	var message = paperDashboard.text(centerX, oneThirdY, titleText);

	messageShadow.attr(titleAttr);	//	make sure the shadow has the same attributes
	messageShadow.attr({fill: '#000'});			//	make sure the shadow is black

	message.attr(titleAttr);

	this.dashboard.push(messageShadow);
	this.dashboard.push(message);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var clickText = "Click on the Icon to see your Report";
	var clickAttr = {
		'font-size': 16,
		fill: "white"
	}

	var clickShadow = paperDashboard.text((centerX + 1), (twoThirdsY + 1), clickText);
	var click = paperDashboard.text(centerX, twoThirdsY, clickText);

	clickShadow.attr(clickAttr);	//	make sure the shadow has the same attributes
	clickShadow.attr({fill: '#000'});			//	make sure the shadow is black

	click.attr(clickAttr);

	this.dashboard.push(clickShadow);
	this.dashboard.push(click);

	var icon = null;
	switch (window.reportbox.getFormat()) {
		case 'PDF':
			icon = getAdobeIconPathsAttrs();
		break;
		case 'CSV':
			icon = getCSVIconPathsAttrs();
		break;
		case 'TXT':
			icon = getTXTIconPathsAttrs();
		break;
	}

	paperDashboard.setStart();

	for (var ndxPath = 0, lp = icon.length; ndxPath < lp; ndxPath++) {
		var obj = paperDashboard.path(icon[ndxPath].path);
		for (var ndxAttr = 0, la = icon[ndxPath].attr.length; ndxAttr < la; ndxAttr++) {
			obj.attr(icon[ndxPath].attr[ndxAttr]);
		}
	}

	var iconSet = paperDashboard.setFinish();
	iconSet.attr({
		href: json.urlPath,
		target: "blank"
	});

	//probably should resize this now...
	iconSet.transform('t420, 250' + 's0.25, 0.25, 0, 0');

	this.dashboard.push(iconSet);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.close();
}

//-----------------------------------------------------------------------------
view.Dashboard.prototype.push = function(object) {
	if (isEmpty(object)) return;

	if (!isEmpty(this.dashboard)) {
		this.dashboard.push(object);
	}
};

//-----------------------------------------------------------------------------
view.Dashboard.prototype.getDashboard = function() {
	return this.dashboard;
};
