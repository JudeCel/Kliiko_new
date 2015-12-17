/*
	data = [{
		id: int,					//	topic id
		name: string,				//	{required}	name of the topic
		active: boolean,		//	{required}	is this topic the active one?

	},{...}]
*/
var onTopics = function(data) {
	thisMain.topics = JSON.parse(data);

	this.x = 132;

	if (thisMain.topics.length == 0) return;	//	if we have no topics, no point hanging around...

	var height = (thisMain.topics.length * 42) + 10;
	window.paperTopicMenu = new Raphael("topicMenu", 202, height);

	var labelAttrLabelText = {
		'font-size':		18,
		fill:				LABEL_COLOUR,
		opacity:			1.0,
		'text-anchor':		"start"
	}

	var headerAttrLabelText = {
		'font-size':		24,
		fill:				TEXT_COLOUR,
		opacity:			1.0,
		'text-anchor':		"start"
	}

	var topicAttrLabelText = {
		'font-size':		18,
		fill:				TEXT_COLOUR,
		opacity:			1.0,
		'text-anchor':		"start"
	}

	var topicAttrLabelBackground = {
		fill:				MENU_BACKGROUND_COLOUR,
		opacity:			0,
		stroke:				MENU_BORDER_COLOUR,
		"stroke-width":		2
	}

	this.sessionLabel = paperTopic.text((this.x - 90), 22, 'Session:').attr(labelAttrLabelText);
	this.headerLabel = paperTopic.text((this.x - 5), 21, thisMain.topics[0].sessionName).attr(headerAttrLabelText);
	this.topicLabel = paperTopic.text((this.x - 70), 53, 'Topic:').attr(labelAttrLabelText);

	var headerLabelBBox = this.headerLabel.getBBox();

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	lets set up our slider
	var currentTopic = null;
	for (var ndx = 0, tl = thisMain.topics.length; ndx < tl; ndx++) {
		currentTopic = thisMain.topics[ndx];
		if (currentTopic.active === true) {
			var topicLabelText = paperTopic.text(this.x, 52, currentTopic.name).attr(topicAttrLabelText);

			var topicLabelBBox = topicLabelText.getBBox();

			var topicLabelBackground = paperTopic.rect(topicLabelBBox.x - 5, topicLabelBBox.y - 5, topicLabelBBox.width + 30, topicLabelBBox.height + 10, 5).attr(topicAttrLabelBackground);
			topicLabelText.toFront();

			var path = "M" + (topicLabelBBox.x + topicLabelBBox.width + 7) + "," + (topicLabelBBox.height + 28) + "l10,0l-5,10Z";
			var selectArrow = paperTopic.path(path).attr({
				fill:				"#365880",
				opacity:			1.0,
				stroke:				"#365880",
				"stroke-width":		1
			})

			//    now we need the counter for chats (see utilities.js)
			var counter = createCounter({
				paper: paperTopic,
				x: (this.x + topicLabelBBox.width + 20),
				y: 42,
				counter: 0,
				opacity: 1.0
			});

			//    now we need the counter for replies(see utilities.js)
			var counterReplies = createCounter({
				paper: paperTopic,
				x: (this.x + topicLabelBBox.width + 20),
				y: 62,
				counter: 0,
				opacity: 1.0,
				colour: '#304064'
			});

			topicLabelBackground.attr({title: "Select Topic"});
			topicLabelText.attr({title: "Select Topic"});

			thisMain.topicLabel = paperTopic.set();
			thisMain.topicLabel.data("this", this);
			thisMain.topicLabel.push(
				topicLabelBackground,					//	window.topicLabel[0]
				topicLabelText,							//	window.topicLabel[1]
				counter.background,						//	window.topicLabel[2]
				counter.text,							//	window.topicLabel[3]
				counterReplies.background,				//	window.topicLabel[4]
				counterReplies.text,					//	window.topicLabel[5]
				selectArrow								//	window.topicLabel[6]
			);

			//	OK, lets update this label, make sure it's set up properly
			window.topicTitle = currentTopic.name;
			thisMain.topicLabel.attr({title: "Select Topic"});

			var animationInit = Raphael.animation({"opacity": 1.0}, 500, function() {});

			thisMain.topicLabel.animate(animationInit.delay(0));

			//	what happens if we hover over the button?
			thisMain.topicLabel.hover(
				//	hover in
				function() {
					//var me = this.data("this");

					var animationHoverIn = Raphael.animation({"opacity": 0.5}, 500);

					thisMain.topicLabel.animate(animationHoverIn.delay(0));
				},
				//	hover out
				function() {
					//var me = this.data("this");
					var animationHoverOut = Raphael.animation({"opacity": 1.0}, 500);
					thisMain.topicLabel.animate(animationHoverOut.delay(0));
				}
			);

			thisMain.topicLabel.click(function() {
				var topicMenuJSON = {
					x:	 				0,
					y:					0,
					width:				200,
					height:				height,
					radius:				5,
					margin: 			1.75,
					thisMain:			thisMain,			//	pointer to the "this" structure in topic.html
					paper:				paperTopicMenu,		//	pointer to the canvas we are drawing on
					data:				data
				}

				var divTopicMenu = document.getElementById("topicMenu");

				if (isEmpty(thisMain.topicMenu)) {
					divTopicMenu.style.display="block";
					thisMain.topicMenu = new sf.ifs.View.TopicMenu(topicMenuJSON);
					thisMain.topicMenu.draw();
				} else {
					divTopicMenu.style.display="none";
					thisMain.topicMenu.hide();
				}
			});

			if (!isEmpty(currentTopic.id)) {
				window.topicID = currentTopic.id;
				socket.emit('settopicid', window.topicID, false, window.userID);
			}
            //moving from onParticipants.js
            var expandBillboard = document.getElementById("expandBillboard");
            if(window.role == "facilitator" && window.topicID != null){
                expandBillboard.style.display = "block";
            } else{
                expandBillboard.style.display = "none";
            }

			break;
		}
	}
};

/*
	json = {
		label: string,						//	{defaults to ""}
		activeTopic: boolean,				//	{defaults to false}
		userID: int, 						//	who sent this?
		topicID: int 						//	{defaults to window.topicID, if this isn't set and activeTopic is true, defaults to the active topic within window.topics[]}
	}
*/
onTopicsUpdateTopic = function(json) {
	//	are our params OK?
	if (isEmpty(json)) return;
	if (isEmpty(json.userID)) return;

	//	set up some defaults
	if (isEmpty(json.topicID)) json.topicID = -1;
	if (isEmpty(json.label)) json.label = "";
	if (isEmpty(json.activeTopic)) json.activeTopic = false;	//	default to false

	if (isEmpty(window.topicID)) window.topicID = json.topicID;

	this.x = 132;

	var labelBBox = null;
	var count = 0,
		countReplies = 0;

	if (window.userID == json.userID) {
		window.topicLabel[1].attr({text: json.label});
		labelBBox = topicLabel[1].getBBox();

		window.topicLabel[0].attr({width: (labelBBox.width + 30)});
		var path = "M" + (labelBBox.x + labelBBox.width + 7) + "," + (labelBBox.height + 28) + "l10,0l-5,10Z";
		window.topicLabel[6].attr({path: path});
	}

	labelBBox = window.topicLabel[1].getBBox();

	var chatCounter,
		repliesCounter;

	var currentID = 0,
		row;

	for (var ndx = 0, lt = window.topics.length; ndx < lt; ndx++) {
		if (!isEmpty(window.topicChatCounter['topic_' + window.topics[ndx].id])) {
			if (window.topicID == window.topics[ndx].id) {
				window.topicChatCounter['topic_' + window.topics[ndx].id].count = 0;	//	lets reset this
				while (window.topicChatCounter['topic_' + window.topics[ndx].id].ids.length > 0) {
					currentID = window.topicChatCounter['topic_' + window.topics[ndx].id].ids.pop();
					row = document.getElementById('tr_' + currentID);
					row.style.backgroundColor = "#679fd2";
					$('#tr_' + currentID).animate({backgroundColor: '#679fd2'}, 60000, function() {
						$('#tr_' + currentID).animate({backgroundColor: '#efedec'}, 10000);
					});
				}
			} else {
				chatCounter = window.topicChatCounter['topic_' + window.topics[ndx].id].count;
				count = (count + chatCounter);
			}
		}

		if (!isEmpty(window.topicRepliesCounter['topic_' + window.topics[ndx].id])) {
			//	is the current topic this one?
			if (window.topicID == window.topics[ndx].id) {
				window.topicRepliesCounter['topic_' + window.topics[ndx].id].count = 0;	//	lets reset this
				while (window.topicRepliesCounter['topic_' + window.topics[ndx].id].ids.length > 0) {
					currentID = window.topicRepliesCounter['topic_' + window.topics[ndx].id].ids.pop();
					row = document.getElementById('tr_' + currentID);
					if (!isEmpty(row)) {
						row.style.backgroundColor = "#679fd2";
						$('#tr_' + currentID).animate({backgroundColor: '#679fd2'}, 60000, function() {
							$('#tr_' + currentID).animate({backgroundColor: '#efedec'}, 10000);
						});
					}
				}
			} else {
				repliesCounter = window.topicRepliesCounter['topic_' + window.topics[ndx].id].count;
				countReplies = (countReplies + repliesCounter);
			}
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	change the chat counter
	window.topicLabel[3].attr({text: count.toString()});
	var counterBBox = topicLabel[3].getBBox();

	//	OK, lets reposition the text now, then re-get the bbox
	window.topicLabel[3].attr({x: (this.x + labelBBox.width + 20)})
	counterBBox = topicLabel[3].getBBox();

	window.topicLabel[2].attr({x: (counterBBox.x - 5), width: (counterBBox.width + 10)});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	if (count > 0) {
		window.topicLabel[2].show();
		window.topicLabel[3].show();
	} else {
		window.topicLabel[2].hide();
		window.topicLabel[3].hide();
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	change the replies counter
	window.topicLabel[5].attr({text: countReplies.toString()});
	var counterBBoxReplies = topicLabel[5].getBBox();

	//	OK, lets reposition the text now, then re-get the bbox
	window.topicLabel[5].attr({x: (this.x + labelBBox.width + 20)})
	counterBBoxReplies = topicLabel[5].getBBox();

	window.topicLabel[4].attr({x: (counterBBoxReplies.x - 5), width: (counterBBoxReplies.width + 10)});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	if (countReplies > 0) {
		window.topicLabel[4].show();
		window.topicLabel[5].show();
	} else {
		window.topicLabel[4].hide();
		window.topicLabel[5].hide();
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	do we have a topicID?
	var topicNdx = 0;
	if (json.topicID > -1) {
		if (window.topicID > -1) {
			//	No?, well, lets find it (if we can)
			if (json.activeTopic == true) {
				if (!isEmpty(window.topics)) {
					for (topicNdx = 0, lt = window.topics.length; topicNdx < lt; topicNdx++) {
						if (window.topics[topicNdx].active == true) {
							json.topicID = window.topics[topicNdx].id;
							if (window.userID == json.userID) {
								window.topicID = json.topicID;
							}
						}
					}
				}
			}
		} else {
			//	not sure if we'd ever get here, but here it is anyway...
			if (window.userID == json.userID) {
				window.topicID = json.topicID;
			}
		}
	} else {
		json.topicID = window.topicID;
	}

	//	OK, json.topicID is now set, lets see if this is infact the active topic
	for (topicNdx = 0, lt = window.topics.length; topicNdx < lt; topicNdx++) {
		if (window.topics[topicNdx].id == json.topicID) {
			json.activeTopic = (window.topics[topicNdx].active == true);

			break;
		}
	}

	//	lets set the colour of our current topic
	if (window.userID == json.userID) {
		if (json.activeTopic == true) {
			window.topicLabel[1].attr({fill: TEXT_COLOUR});
		} else {
			window.topicLabel[1].attr({fill: "black"});
		}
	}

	//	maybe now we have a topicID
	if (!isEmpty(window.topicID)) {
		if (!isEmpty(window.userID)) {
			if (window.userID == json.userID) {
				//	lets clear out replies we "should" have read by now
				socket.emit('delete_offline_transactions', json.topicID, window.userID);

				if (!isEmpty(json.label)) {
					//	this message is for everyone to update the caption under the avatar
					socket.emit('setavatarcaption', window.userID, window.topicID, json.label);
				}
			}
		}
	}
};
