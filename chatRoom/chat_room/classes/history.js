var view = namespace('sf.ifs.View');

/*
	json: {
		radius: float,
		marginTop: float,
		thisMain: pointer,		//	pointer to the "this" structure in topic.html
		paper: pointer			//	pointer to the canvas we are drawing on
	}
*/
view.History = function(json) {
	this.json = json;

	this.myHistoryBorder = null;
};

view.History.prototype.draw = function() {
	//	make sure we remove any old objects first

	if (this.myHistoryBorder) {
		if (this.myHistoryBorder[0]) this.myHistoryBorder.remove();
	}

	var historyWidth = this.json.paper.canvas.clientWidth ? this.json.paper.canvas.clientWidth : this.json.paper.width,
		historyHeight = this.json.paper.canvas.clientHeight ? this.json.paper.canvas.clientHeight : this.json.paper.height;

	this.myHistoryBorder = this.json.paper.path(getRoundedRectToPath(1, 1, historyWidth - 2, historyHeight - 2, this.json.radius)).attr({fill: "#efedec", stroke: "#e1ddda", "stroke-width": 2});

	var title = paperTitleConversation.image(
		window.URL_PATH + window.CHAT_ROOM_PATH + "resources/images/title_conversation.png",
		0,
		0,
		92,
		30
	);
};

view.History.prototype.addChat = function(avatarJSON, data, avatarIndex, insertAfter) {
	window.tagOnClick = function(tag_id) {
		var element = document.getElementById(tag_id);
		var value = null;

		switch (element.className) {
			case 'tag tag_set': {
				element.setAttribute("class", "tag tag_unset");
				value = 0;
			}
			break;
			case 'tag tag_unset': {
				element.setAttribute("class", "tag tag_set");
				value = 1;
			}
			break;
		}

		if (!isEmpty(value)) {
			var jsonMessage = {
				id: tag_id,
				value: value
			}
			window.socket.emit('updatetag', jsonMessage);
		}
	}

	window.replyOnClick = function(tag_id, userId, colour) {
		//alert("" + event_id + " : " + userId);
		window.chat.setMode("reply", {
			replyTo: parseInt(userId),
			messageId: parseInt(tag_id),
			colour: colour
		});
	}

	window.messageOnClick = function(message) {
		message = decodeURI(message);

		var html =	"<div id=\"ta\" style=\"height: 100%; width: 100%;\" > " +
					"    <textarea style=\"height: 100%; width: 100%;\" >" +
					message +
					"    </textarea>" +
					"</div>";

		window.dashboard.setHTML(html);
		window.dashboard.toFront();
		window.dashboard.close();
	}

	//----------------------------------------------------------------------------
	//	lets get data from our arguments
	var message = data.input;
	var tagId = data.id;
	var isTag = (data.tag === "1");
	var replyId = null;
	var replyUserId = null;
	if (!isEmpty(data.replyId)) {
		replyId = parseInt(data.replyId);
		replyUserId = parseInt(data.replyUserId);
	}
	var date = stringToDate(data.date);
	var showReply = true;
	var showEllipsis = true;

	//----------------------------------------------------------------------------
	//	lets get our reply to info (if needed)
	if (!isEmpty(replyId)) {
		for (var ndx = 0, pl = participants.length; ndx < pl; ndx++) {
			if (replyUserId === participants[ndx].userId) {
				message = "<b><i>@" + participants[ndx].fullName + ":</i></b> " + message;
				date = stringToDate(data.replyDate);
				showReply = false;

				break;
			}
		}
	}

	//----------------------------------------------------------------------------
	//	table elements
	var table = document.getElementById("historyTable");
	var numberOfRows = table.rows.length;
	var row = null;
	var cellImages = null;
	var cellText = null;

	var now = new Date();

	//	elements within the innerHTML
	var avatar = null;
	var tag = null;
	var comment = null;
	var reply = null;

	var insertRowIndex = 0;
	if (typeof insertAfter != "undefined") insertRowIndex = insertAfter;

	//	lets set up our row first...
	row = table.insertRow(insertAfter);
	var rowClass = ((numberOfRows % 2) === 0) ? "rowEven" : "rowOdd";

	/*
	var divContainerBegin = "<div class=\"" + rowClass + "\">";
	var divContainerEnd = "</div>";
	row.innerHTML = divContainerBegin;
	*/

	cellImages = row.insertCell(0);
	cellText = row.insertCell(1);

	//row.innerHTML = row.innerHTML + divContainerEnd;


	var divName = "<div class=\"name\" style=\"background-color: " + colourToHex(avatarJSON.colour) + "\">" + avatarJSON.fullName + "</div>";
	var divDate = "<div class=\"date\" style=\"background-color: " + colourToHex(avatarJSON.colour) + "\">" + date.format("ddd H:MM d/m") + "</div>";
	var divReply = "";
	if (avatarJSON.userId != window.userID) {
		var userId = avatarJSON.userId;
		var colour = colourToHex(avatarJSON.colour);
		showReply = true;
	} else {
		showReply = false;
	}

	divAvatar = "<div class=\"avatar avatar_" + avatarIndex + "\"></div>";

	//	only facilitators need to see the tag
	var divTag = null;
	if ((window.role === 'facilitator') || (window.role === 'co-facilitator')) {
		if (isTag) {
			divTag = "<div class=\"tag tag_set\" id=\"" + tagId + "\" onclick=\"javascript:window.tagOnClick('" + tagId + "')\" />" + "</div>";
		} else {
			divTag = "<div class=\"tag tag_unset\" id=\"" + tagId + "\" onclick=\"javascript:window.tagOnClick('" + tagId + "')\" />" + "</div>";
		}
	} else {
		divTag = "<div id=\"" + tagId + "\" />";
	}
	cellImages.innerHTML =	divAvatar +
							divTag;

	var divComment = null;
	var divEllipsis = "";

	var comment = null;
	var commentJSON = formatText(message, 300);
	if (commentJSON.more) {
		comment = commentJSON.text + "...";
		showEllipsis = true;
	} else {
		comment = commentJSON.text;
		showEllipsis = false;
	}

	/*
	if ((showReply) && (showEllipsis) {
		divReply = "<div class=\"reply reply_set\" onclick=\"javascript:window.replyOnClick('" + tagId + "', '" + userId + "', '" + colour + "')\"/>" + "</div>";
		divEllipsis = "<div class=\"ellipsis\" onclick=\"javascript:window.messageOnClick('" + message + "')\" />" + "</div>";
	} else {
		if (showReply) {
			divReply = "<div class=\"reply reply_set\" onclick=\"javascript:window.replyOnClick('" + tagId + "', '" + userId + "', '" + colour + "')\"/>" + "</div>";
		} else {
			if (showEllipsis) {
				divEllipsis = "<div class=\"ellipsis\" onclick=\"javascript:window.messageOnClick('" + message + "')\" />" + "</div>";
			}
		}
	}
	*/

	if (showReply) {
		divReply = "<div class=\"reply reply_set\" onclick=\"javascript:window.replyOnClick('" + tagId + "', '" + userId + "', '" + colour + "')\" />" + "</div>";
	} else {
		divReply = "<div class=\"reply \" />" + "</div>";
	}

	if (showEllipsis) {
		divEllipsis = "<div class=\"ellipsis ellipsis_set\" onclick=\"javascript:window.messageOnClick('" + encodeURI(message) + "')\" />" + "</div>";
	} else {
		divEllipsis = "<div class=\"ellipsis\" />" + "</div>";
	}

	divComment = "<div class=\"comment comment_" + avatarJSON.role + "\">" + comment + "</div>";

	if (avatarJSON.userId === window.userID) showReply = false;

	cellText.innerHTML =	divName +
							divDate +
							divComment +
							divEllipsis +
							divReply;
}
