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
	this.filterBy = null;
	//Type 0 = no filter
	//Type 1 = filter by avatar
	//Type 2 = filter by tag
	this.filterType = 0; 
};

view.History.prototype.clearTable = function() {
	var tableDIV = document.getElementById("chatHistoryArea");
	
	tableDIV.innerHTML = '<table id="chatHistoryTable"></table>';
};

view.History.prototype.draw = function() {
	//	make sure we remove any old objects first
	if (this.myHistoryBorder) {
		if (this.myHistoryBorder[0]) this.myHistoryBorder.remove();
	}

	var chatHistoryWidth = this.json.paper.canvas.clientWidth ? this.json.paper.canvas.clientWidth : this.json.paper.width,
		chatHistoryHeight = this.json.paper.canvas.clientHeight ? this.json.paper.canvas.clientHeight : this.json.paper.height;
		
	this.myHistoryBorder = this.json.paper.path(getRoundedRectToPath(1, 1, chatHistoryWidth - 2, chatHistoryHeight - 2, this.json.radius)).attr({fill: "#efedec", stroke: "#e1ddda", "stroke-width": 2});

	var title = paperTitleConversation.image(
		window.URL_PATH + window.CHAT_ROOM_PATH + "resources/images/title_conversation.png",
		0,
		0,
		92,
		30
	);
};

view.History.prototype.filterChatHistory = function() {
	var tableRows = document.getElementById("chatHistoryTable").getElementsByTagName("tr");
	for (var ndxRow = 0, rl = tableRows.length; ndxRow < rl; ndxRow++) {
		switch(window.chatHistory.filterType) {
			case 0:
				tableRows[ndxRow].style.display = "block";
				break;
			case 1:
				style = 'none';	//	how by default
				if (tableRows[ndxRow].className === window.chatHistory.filterBy) style = "block";
				tableRows[ndxRow].style.display = style;
				break;
			case 2:
				style = 'none';
				if (tableRows[ndxRow].tag == window.chatHistory.filterBy) style = "block";
				tableRows[ndxRow].style.display = style;
				break;
		}
	}
};

//--------------------------------------------------------------------------------
//	add a new row to the chat history
/*
	avatarJSON = {
		fullName: string,
		userId: int,
		role: string,			//	{default: 'participant'}	facilitator' | 'owner' | 'participant'
		colour: int,			//	colour of the participant
		avatarInfo: string		//	"head:face:hair:top:accessory:desk", i.e., 0:4:8:9:10:11 (see users table)
	}

	data = {
		id: int,
		tag: int,
		thumbs_up: int,
		date: Date(),
		replyId: int,
		replyUserId: int,
		replyDate: Date(),
		emotion: string,		//	"normal" | "angry" and so on
		input: string,			//	message,
		mode: {
			type: string,		//	'reply' | 'billboard'
			replyTo: int,
			messageId: int
		}
	}
*/
view.History.prototype.addChat = function(avatarJSON, data, avatarIndex, animateChatBackground) {
	var inline = "style=\"display: inline\"";
	var minHeight = (35 + 24);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	window.avatarOnClick = function(avatar_id) {
		var currentFilter = window.chatHistory.filterBy;
		var currentType = window.chatHistory.filterType;
		
		if (!isEmpty(currentFilter)) {
			if (currentFilter === avatar_id) {
				currentFilter = null;
				currentType = 0;
			} else {
				currentFilter = avatar_id;
				currentType = 1;
			}
		} else {
			currentFilter = avatar_id;
			currentType = 1;
		}
		
		window.chatHistory.filterBy = currentFilter;
		window.chatHistory.filterType = currentType;
		window.chatHistory.filterChatHistory();
	};
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	window.tagOnClick = function(row_id) {
		var row_tag = document.getElementById(row_id).tag;

		var currentFilter = window.chatHistory.filterBy;
		var currentType = window.chatHistory.filterType;
		
		if (!isEmpty(currentFilter)) {
			if (currentFilter === row_tag) {
				currentFilter = null;
				currentType = 0;
			} else {
				currentFilter = row_tag;
				currentType = 2;
			}
		} else {
			currentFilter = row_tag;
			currentType = 2;
		}
		
		window.chatHistory.filterBy = currentFilter;
		window.chatHistory.filterType = currentType;
		window.chatHistory.filterChatHistory();
	};

	window.miniTagOnClick = function(tag_id, toSet, row_id){
		var element = document.getElementById(tag_id);
		var value = null;
				
		if(toSet){
			element.setAttribute("class", "chatTag tag_set");
			value = 1;
		}else{
			element.setAttribute("class", "chatTag tag_unset");
			value = 0;
		}
		
		var row = document.getElementById(row_id);
		if (row.tag != value) {
			var jsonMessage = {
				id: tag_id,
				value: value
			};
			window.socket.emit('updatetag', jsonMessage);
			row.tag = value;
		}
	};

	window.thumbsUpOnClick = function(data_id, row_id) {
		if (window.role != 'observer') {
			window.socket.emit('thumbs_up', data_id, row_id);
		}
	};

	window.deleteOnClick = function(data_id){
		window.dashboard.showMessage({
			message: {
				text: "Deleting this Post will\ndelete it permanently.\n \nAre you sure you want to delete\nthis Post?",
				attr: {
					'font-size': 36,
					fill: "white"
				}
			},
			dismiss: {
				cancel: {						//	check using window.dashboard.YES
					text:	"Cancel",
					attr: {
						'font-size': 24,
						fill: "white"
					}
				},
				yes: {						//	check using window.dashboard.YES
					text:	"OK",
					attr: {
						'font-size': 24,
						fill: "white"
					}
				}
			}
		}, function(value) {
			if (value === window.dashboard.YES) {
				var dataJson = {
					id : data_id 
				};
				window.socket.emit('deletechat', dataJson);
			}

			window.dashboard.toBack();		//	time to hide the dashboard
		});
	};

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	window.replyOnClick = function(tag_id, user_id, colour) {
		window.chat.setMode("reply", {
			tagId: tag_id,
			replyTo: parseInt(user_id),
			messageId: parseInt(tag_id.substring(4)),
			colour: colour
		});
	};

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    window.editOnClick = function(data_id, data_tag, user_id, colour) {
        window.chat.setMode("edit", {
            id: data_id,
            tag: data_tag,
            user_id: user_id,
            colour: colour,
            message: $('#post_' + data_id).html()
        });
    };

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	window.messageOnClick = function(message) {
		message = decodePunctuation(decodeURI(message));

		var html =	'<div style="position:relative; left:0px; top:0px; width:0px; height: 0px;">' +
					'	<div style="position:absolute; left: 20px; top:10px; width: 600px; height: 460px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
					'    	<textarea style="height: 100%; width: 100%; resize: none; color: white; background-color: transparent; border-style: none;" >' + message + '</textarea>' +
					'	</div>' +
					'</div>';

		window.dashboard.setFramedHTML(html);
		window.dashboard.toFront();
		window.dashboard.close();
	};
			
	//----------------------------------------------------------------------------
	//	lets get data from our arguments
	var message = data.input;
	var tagId = "tag_" + data.id;
	var miniTagId = "miniTag_" + data.id;
	var avatarId = "avatar_" + data.id;
    var postId = "post_" + data.id;
	var thumbsUpId = "thumbs_up_" + data.id;
	var thumbsUpCount = data.thumbs_up || 0;
	var isTag = (data.tag == "1");
	var replyId = null;
	var replyUserId = null;

	if (isEmpty(animateChatBackground)) animateChatBackground = false;
	
	//	do we need to insert this somewhere other than the top?
	//	that is, is this message a reply to another message?
	var insertRowIndex = 0;
	if (!isEmpty(data.replyId)) {
		replyId = parseInt(data.replyId);
		replyUserId = parseInt(data.replyUserId);

		var element = document.getElementById("tag_" + replyId);
		//insertAfter = (element.parentElement.parentElement.rowIndex + 1);
		insertRowIndex = (getRowIndex(element) + 1);	//	if the rowIndex isn't found, -1 is returned, so insertRowIndex will be 0 anyway...
	}
	
	var date = data.date;
	var showReply = true;
	var showThumbsUp = (avatarJSON.user_id != window.userID);
	var showEllipsis = true;
	var showIndent = false;		//	do we indent this comment?
    var showEdit = (avatarJSON.userId == window.userID);

	// console.log("---------------------------------------------------------------------------------------------");
	// console.log(window.userID);
	// console.log("---------------------------------------------------------------------------------------------");
	// console.log(data);
	// console.log("---------------------------------------------------------------------------------------------");
	// console.log(avatarJSON);
	// console.log("---------------------------------------------------------------------------------------------");
	// console.log(showThumbsUp);
	// console.log("---------------------------------------------------------------------------------------------");

	//----------------------------------------------------------------------------
	//	lets get our reply to info (if needed)
	if (!isEmpty(replyId)) {
		for (var ndx = 0, pl = participants.length; ndx < pl; ndx++) {
			if (replyUserId === participants[ndx].user_id) {
				message = "<b><i>@" + participants[ndx].fullName + ":</i></b> " + message;
				date = data.replyDate;
				//showReply = false;
				showIndent = true;		//	we need to indent this comment...
				
				break;
			}
		}
	}

	//----------------------------------------------------------------------------
	//	table elements
	var table = document.getElementById("chatHistoryTable");
	var numberOfRows = table.rows.length;
	var row = null;
	var cell = null;
	
	var now = new Date();
				
	//	elements within the innerHTML
	var avatar = null;
	var tag = null;
	var comment = null;
	var reply = null;
				
	//var insertRowIndex = 0;
	//if (typeof insertAfter != "undefined") insertRowIndex = insertAfter;

	//	lets set up our row first...
	row = table.insertRow(insertRowIndex);
	
	row.className = "avatar_" + avatarIndex;
	row.tag = data.tag;
	row.id = "tr_" + data.id;
	if (animateChatBackground) {
		row.style.backgroundColor = MENU_BACKGROUND_COLOUR;
	}
	
	var rowClass = ((numberOfRows % 2) === 0) ? "rowEven" : "rowOdd";

	//	format for each chat cell
	//	A	chatContainer
	//	B	chatIndent {optional}
	//	C	chatAvatarContainer
	//	Ca	chatAvatar
	//	Cb	chatTag
	//	D	chatContentContainer
	//	Da	chatContentHeader
	//	Da1	chatContentHeaderName
	//	Da2	chatContentHeaderDate
	//	Db	chatContent
	//	Dc	chatContentMore
	//	Dd	chatContentReply
	//	De	chatMiniTagUnset
	//	Df	chatMiniTagSet
	//	Dg	chatDelete
	//	Dh	chatThumbsUp
    //  Di  chatContentEdit
	//
	//	+-A-----------------------------------------------------------------------+
	//	| +-B-+ +-C-----+ +-D---------------------------------------------------+ |
	//	| |   | | +-a-+ | | +-a-----------------------------------------------+ | |
	//	| |   | | |   | | | | +-1--------------------++-2-------------------+ | | |
	//	| |   | | |   | | | | |                      ||                     | | | |
	//	| |   | | |   | | | | +----------------------++---------------------+ | | |
	//	| |   | | |   | | | +-------------------------------------------------+ | |
	//	| |   | | |   | | | +-b-----------------------------------------------+ | |
	//	| |   | | |   | | | |                                                 | | |
	//	| |   | | |   | | | |                                                 | | |
	//	| |   | | +---+ | | |                                                 | | |
	//	| |   | | +-b-+ | | |                                                 | | |
	//	| |   | | |   | | | |                                                 | | |
	//	| |   | | |   | | | |                                                 | | |
	//	| |   | | |   | | | |                                                 | | |
	//	| |   | | |   | | | |                                                 | | |
	//	| |   | | |   | | | +-------------------------------------------------+ | |
	//	| |   | | |   | | |                                                     | |
	//	| |   | | |   | | | +-c-+           +-i-+ +-h-+ +-e-+ +-f-+ +-d-+ +-g-+ | |
	//	| |   | | |   | | | |   |           |   | |   | |   | |   | |   | |   | | |
	//	| |   | | +---+ | | +---+           +---+ +---+ +---+ +---+ +---+ +---+ | |
	//	| +---+ +-------+ +-----------------------------------------------------+ |
	//	+-------------------------------------------------------------------------+
	//

	//	do we need to hide the indent DIV?
	var chatHistoryWidth = 260,
		avatarWidth = 50,
		avatarHeight = 35,
		tagWidth = 24,
		tagHeight = 24,
		textHeight = 17,
		currentChatHistoryWidth = chatHistoryWidth - avatarWidth,
		height = minHeight;
		
	var indentHide = true;
	if (showIndent) {
		indentHide = false;
		currentChatHistoryWidth = currentChatHistoryWidth - avatarWidth;
	}
	
	//	only facilitators to filter chat history by avatar
	var avatarClass = "";
	var avatarOnClick = null;
	//if ((window.role === 'facilitator') || (window.role === 'owner')) {
		avatarClass = "avatar_unfiltered";
		avatarOnClick = "javascript:window.avatarOnClick('" + row.className + "')";
	//}
	
	//	show tag according to current tag status
	var tagClass = "";
	var tagOnClick = null;
	if (isTag) {
		tagClass = "tag_set";
	} else {
		tagClass = "tag_unset";
	}

	//Only show mini-tag to facilitator and owner
	var showControlTag = false;
	if ((window.role === 'facilitator') || (window.role === 'owner')) {
		showControlTag = true;
	}
	
	//	do we have any content?
	var content = "";
		
	var ellipsisClass = "";
	
	var contentJSON = formatText(message, 300);
	if (contentJSON.more) {
		content = contentJSON.text + "&hellip;";	//	add the horizontal ellipse
		showEllipsis = true;
		ellipsisClass = "chatContentMore_set";
	} else {
		content = contentJSON.text;
		showEllipsis = false;
	}
	
	var replyOnClick = null;
	var replyClass = "";
	if (showReply) {
		replyClass = "chatContentReply_set";
		replyOnClick = "javascript:window.replyOnClick('" + tagId + "', '" + avatarJSON.userId + "', '" + avatarJSON.colour + "')";
	}
	
	//	do we need to show the reply?
	if(avatarJSON.userId == window.userID){
		//showReply = false;
	}

	var onClickMessage = "javascript:window.messageOnClick('" + encodeURI(encodePunctuation(message)) + "')";

	var chatTagElement = {
			//	Cb
			tagId: tagId,
			width: tagWidth,
			height: tagHeight,
			inline: true		
	};
	if ((window.role === 'facilitator') || (window.role === 'owner') || (window.role === 'observer')) {
		chatTagElement = {
			//	Cb
			tagId: tagId,
			className: "chatTag " + tagClass,
			onClick: "javascript:window.tagOnClick('" + row.id + "')",
			width: tagWidth,
			height: tagHeight,
			inline: true
		}
	}

	var cellDescriptionAsJSON = {
		className: "chatContainer",
		inline: false,
		style: 'padding-bottom: 10px',
		items: [{
			//	B
			className: "chatIndent",
			width: avatarWidth,
			height: height,
			hide: indentHide,
			inline: true
		}, {
			//	C
			className: "chatAvatarContainer",
			width: avatarWidth,
			height: height,
			inline: true,
			items: [{
				//	a
				tagId: avatarId,
				className: "chatAvatar avatar_" + avatarIndex + " " + avatarClass,
				onClick: avatarOnClick,
				width: avatarWidth,
				height: avatarHeight,
				inline: true
			},
				// b
				chatTagElement]
		}, {
			//	D
			className: "chatContentContainer",
			width: currentChatHistoryWidth,
			height: height,
			inline: true,
			items: [{
				//	a
				className: "chatContentHeader",
				style: "background-color: " + avatarJSON.colour,
				width: currentChatHistoryWidth,
				height: textHeight,
				inline: true,
				items: [{
					//	1
					className: "chatContentHeaderName",
					content: avatarJSON.fullName,
					inline: true
				},{
					//	2
					className: "chatContentHeaderDate",
					content: date.format("ddd H:MM d/m"),
					//content: date.toLocaleString(),
					inline: true
				}]
			},{
				//	b
                tagId: postId,
				className: "chatContent " + avatarJSON.role,
				content: content,
				width: currentChatHistoryWidth - 10,	//	(5px padding)
				inline: true
			},{
				//	c
				className: "chatContentMore " + ellipsisClass,
				title: 'See more of this Comment',
				hide: !showEllipsis,
				onClick: onClickMessage,
				inline: true
			},{
				//	g
				className: "chatDelete " + "chatDelete_set",
				hide: !showControlTag,
				title: 'Remove Comment',
				width: tagWidth,
				height: tagHeight,
				onClick: "javascript:window.deleteOnClick('" + data.id + "','" + data.topic_id +"')",
				inline: true
			},{
				//	d
				className: "chatContentReply " + replyClass,
				hide: !showReply,
				title: 'Reply',
				onClick: replyOnClick,
				width: tagWidth,
				height: tagHeight,
				inline: true
			},{
				//	f
				tagId: miniTagId,
				className: "miniChatTag " + "minitag_set",
				onClick: "javascript:window.miniTagOnClick('" + tagId + "'," + true + ",'" + row.id + "')",
				hide: !showControlTag,
				title: 'Tag this Comment',
				width: tagWidth,
				height: tagHeight,
				inline: true
			},{
				//	e
				tagId: miniTagId,
				className: "miniChatTag " + "minitag_unset",
				onClick: "javascript:window.miniTagOnClick('" + tagId + "'," + false + ",'" + row.id + "')",
				hide: !showControlTag,
				title: 'Untag this Comment',
				width: tagWidth,
				height: tagHeight,
				inline: true
			},{
				//	h
				tagId: thumbsUpId,
				className: "chatThumbsUp " + "chatThumbsUp_set",
				content: thumbsUpCount.toString(),
				title: 'Vote up this Chat',
				width: tagWidth + 5,
				height: tagHeight,
				onClick: (showThumbsUp) ? "javascript:window.thumbsUpOnClick('" + data.id + "','" + row.id +"')" : null,
				inline: true
			},{
                //i
                tagIg: "content_edit_" + data.id,
                className: "chatContentEdit " + (showEdit ? "chatContentEdit_set" : "chatContentEdit_unset"),
                title: "Edit",
                width: tagWidth,
                height: tagHeight,
                onClick: showEdit ? "javascript:window.editOnClick('" + data.id + "', '" + data.tag + "', '" + avatarJSON.userId + "', '" + avatarJSON.colour + "')" : null,
                inline: true
            }]
		}]
	}

	//	lets create our cell
	var cell = row.insertCell(0);
	
	cell.innerHTML = JSONtoHTML(cellDescriptionAsJSON);

	//	OK, the row has been added.  Lets draw our character (Raphael) into this row
	var attributes = avatarJSON.avatarInfo.split(":");
	var paperAvatar = Raphael(avatarId);
	paperAvatar.setViewBox(10, 10, 100, 70, false);
	heads[attributes[0]](paperAvatar);


	var emotion = 4;	//	default
	switch(data.emotion) {
		case "angry":
			emotion = 0;
			break;
		case "confused":
			emotion = 1;
			break;
		case "smiling": 
			emotion = 2;
			break;
		case "love":
			emotion = 3;
			break;
		case "normal":
			emotion = 4;
			break;
		case "upset":
			emotion = 5;
			break;
		case "surprised":
			emotion = 6;
			break;
		case "offline": 
		default:
			break;
	}

	faces[emotion](paperAvatar);

	hairs[attributes[2]](paperAvatar);
	tops[attributes[3]](paperAvatar);
	accessories[attributes[4]](paperAvatar);

	//	do we need to animate the background colour?
	if (animateChatBackground) {
		if (typeof $('#' + row.id).animate != "undefined") {
			$('#' + row.id).animate({backgroundColor: '#679fd2'}, 60000, function() {	//	pause with this colour for 1 minute, then fade away in 10 seconds
				$('#' + row.id).animate({backgroundColor: '#efedec'}, 10000);
			});
		}
	}
};

