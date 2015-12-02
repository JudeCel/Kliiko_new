var initMainMenu = function(role) {
	var iconClick = function() {
		var id = this.data("id");

		switch (id) {
			case 'clearconsole': {
				window.dashboard.showMessage({
					message: {
						text: "Are you sure you want to\nclear the Console?",
						attr: {
							'font-size': 36,
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
						},
						no: {						//	check using window.dashboard.YES
							text:	"Not Yet",
							attr: {
								'font-size': 24,
								fill: "white"
							}
						}
					}
				}, function(value) {
					if (value === window.dashboard.YES) {
						topic.getConsole().setConsole({
							type: "null",
							content: "null"
						});
					}

					//	make sure we close the dashboard first
					window.dashboard.toBack();	//	time to hide the dashboard
				});
			}
			break;
			case 'video':
			case 'audio':
			case 'vote':
			case 'image': {
				try {
					socket.emit('getresources', thisMain.sessionID, id, true);
				} catch (e) {
				}
			}
			break;
			case 'personalimage': {
				var json = {
					type: 'pictureboard',
					content: 'toggle',
					updateEvent: true
				}

				topic.getConsole().setConsole(json);

			}
			break;
			case 'reports':
				socket.emit('getreporttopics', window.sessionID, window.userID);
				break;
			case 'help':
				window.open('http://' + window.domain + ':' + window.port + '/help?r=' + role[0], '_blank');
			break;
			case 'backward':
				window.history.go(-1);
			break;
			case 'quit':
				window.dashboard.showMessage({
					message: {
						text: "Do you wish to leave the chat room?",
						attr: {
							'font-size': 36,
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
						},
						no: {						//	check using window.dashboard.YES
							text:	"Not Yet",
							attr: {
								'font-size': 24,
								fill: "white"
							}
						}
					}
				}, function(value) {
					if (value === window.dashboard.YES) {
						switch(browser) {
							case 'firefox': {
								window.open('', '_parent', '');
								window.close();
							}
							default: {
								window.open('', '_self', '');
								window.close();
							}
						}
					}

					//	make sure we close the dashboard first
					window.dashboard.toBack();	//	time to hide the dashboard
				});
			break;
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	now the menus
	var browser = getBrowser();
	var iconMenus = [];
	var width = 32;
	var list = null;

	var menu = {
		uploadVideo: {
			id: 'video',
			title: 'Upload Video',
			name: 'Video'
		},
		uploadAudio: {
			id: 'audio',
			title: 'Upload Audio',
			name: 'Audio'
		},
		uploadImage: {
			id: 'image',
			title: 'Upload Image',
			name: 'Image'
		},
		personalImage: {
			id: 'personalimage',
			title: 'Activate Personal Images',
			name: 'PersonalImage'
		},
		vote: {
			id: 'vote',
			title: 'Activate Voting Form',
			name: 'Vote'
		},
		clearconsole: {
			id: 'clearconsole',
			title: 'Clear Console',
			name: 'ClearConsole'
		},
		reports: {
			id: 'reports',
			title: 'Generate Reports',
			name: 'Reports'
		},
		help: {
			id: 'help',
			title: 'Help',
			name: 'Help'
		},
		backward: {
			id: 'backward',
			title: 'Back',
			name: 'Backward'
		}
	}

	switch(role) {
		case 'facilitator':
		case 'owner': {
			list = [
				menu.uploadVideo,
				menu.uploadAudio,
				menu.uploadImage,
				menu.personalImage,
				menu.vote,
				menu.clearconsole,
				menu.reports,
				menu.help,
				menu.backward
			];
		}
		break;
		case 'observer': {
			list = [
				menu.reports,
				menu.help
			];
		}
		break;
		default: {
			list = [
				menu.help,
				menu.backward
			];
		}
		break;
	}

	//	if we have nothing, lets get out of here (this should never happen)
	if (isEmpty(list)) return;

	var indexX = 0;
	var x = 0, y = 24;

	for (var listNdx = 0, nl = list.length; listNdx < nl; listNdx++) {
		var currentList = list[listNdx];

		switch (currentList.id) {
			case 'video':
				indexX = 1;
			break;
			case 'audio':
				indexX = 2;
			break;
			case 'image':
				indexX = 3;
			break;
			case 'personalimage':
				indexX = 4;
			break;
			case 'vote':
				indexX = 5;
			break;
			case 'clearconsole':
				indexX = 7;
			break;
			case 'reports':
				indexX = 8;
			break;
			case 'help':
				indexX = 10;
			break;
			case 'backward':
				indexX = 11;
			break;
			case 'quit':
				indexX = 12;
				switch(browser) {
					case 'firefox': continue;
				}
			break;
		}

		x = (366 + (indexX * width));

		iconMenus.push({
			id: currentList.id,
			title: currentList.title,
			position: {
				x: x,
				y: y
			},
			path: eval("get" + currentList.name + "Path()")
		});
	}

	var attr = {fill: ICON_COLOUR, stroke: "none"};
	var attrMouseOver = {stroke: ICON_COLOUR, "stroke-width": 1};
	var attrMouseOut = {stroke: "none"};

	var animationIcon = Raphael.animation({"opacity": 1}, 200);
	var currentIconMenu = null;
	var delayIcon = 0;
	for (var ndx = 0, iml = iconMenus.length; ndx < iml; ndx++) {
		currentIconMenu = iconMenus[ndx];

		var iconBG = paperTopic.rect(currentIconMenu.position.x, currentIconMenu.position.y, 32, 32).attr({fill: BACKGROUND_COLOUR, stroke: BACKGROUND_COLOUR, title: currentIconMenu.title});
		var icon = paperTopic.path(currentIconMenu.path);
		icon.translate(currentIconMenu.position.x, currentIconMenu.position.y). attr(attr).attr({opacity: 0, title: currentIconMenu.title});

		icon.mouseover(function(mouseOverEvent) {
			this.attr(attrMouseOver);
		});

		icon.mouseout(function(mouseOutEvent) {
			this.attr(attrMouseOut);
		});

		iconBG.data("id", currentIconMenu.id);
		iconBG.click(iconClick);

		icon.data("id", currentIconMenu.id);
		icon.click(iconClick);

		icon.animate(animationIcon.delay(delayIcon));
		delayIcon = delayIcon + 200;
	}
};

/*
	(avatarInfo)
	data = [{
		name: string,			//	{required}	users name
		fullName: string,
		userId,
		role: string,			//	{default: 'participant'}	'facilitator' | 'owner' | 'participant'
		colour: int,			//	colour of the participant
		online: boolean,
		avatar_info: string		//	"head:face:hair:top:accessory:desk", i.e., 0:4:8:9:10:11 (see users table)
	},
	{...}]
*/
var onParticipants = function(data) {
	//------------------------------------------------------------------------
	//	do we have what we require?
	if (isEmpty(data)) return;

	window.participants = JSON.parse(data);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	lets login our user
	var currentParticipant = null;
	for (var ndx = 0, pl = window.participants.length; ndx < pl; ndx++) {
		if (!isEmpty(window.participants[ndx])) {
			if (!isEmpty(window.participants[ndx].name)) {
				if (window.participants[ndx].name === window.username) {
					currentParticipant = window.participants[ndx];

					break;
				}
			}
		}
	}

	//	did we find a participant?
	if (isEmpty(currentParticipant)) return;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	lets find our role
	window.role = (!isEmpty(currentParticipant.role)) ? currentParticipant.role : 'participant';

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	set the colour of this participant
	if (isEmpty(currentParticipant.colour)) {
		//	no colour defined, then lets get some defaults
		switch(currentParticipant.role) {
			case 'facilitator': {
				currentParticipant.colour = (255 * 65536);
			}
			break;
			case 'owner': {
				currentParticipant.colour = 6710886;
			}
			break;
			default: {
				currentParticipant.colour = 4473924;
			}
			break;
		}
	} else {
		//	make sure our colour is a number, not a string
		currentParticipant.colour = Number(currentParticipant.colour);
	}

	//------------------------------------------------------------------------
	/*
		Blue Room

		+-----------------------------------------------------------+
		|[   A   ]       [C][C][C][C][C]   [C]   [C][C][C]|[       ]|
		|[      B     ]                                    [   D   ]|
		|-----------------------------------------------------------|
		|     [     ] +------------------------+  +----------------+|
		|     [     ] |                        |  |                ||
		|[   ][  F  ] |           [G]          |  |                ||
		|[ E ][     ] |                        |  |                ||
		|[   ][     ] +------------------------+  |                ||
		|                                         |       [I]      ||
		|[                                       ]|                ||
		|[                                       ]|                ||
		|[                                       ]|                ||
		|[                  [H]                  ]|                ||
		|[                                       ]+----------------||
		|[                                       ]+----------------||
		|[                                       ]|       [J]      ||
		|                                         +----------------||
		+-----------------------------------------------------------+

		[A]	Session Label
		[B] Topic Menu
		[C] Menus (varies depending on window.role)
		[D] Insider Focus Logo
		[E] Facilitator Avatar
		[F] Facilitator Billboard
		[G] Whiteboard / Picture Board / Resource Chooser
		[H] Console area
		[I] Chat History
		[J] Chat

	*/

	//	[C]	lets draw our menu based on the role
	initMainMenu(window.role);

    //[F] Facilitator expandBillboard
    /* moving to onTopics.js
    var expandBillboard = document.getElementById("expandBillboard");
    if(window.role === "facilitator" && window.topicID != null){
        expandBillboard.style.display = "block";
    } else{
        expandBillboard.style.display = "none";
    }
    */
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	[J] Chat
	if (window.role === "observer") {
		//	lets hide the chat DIV
		var chatDiv = document.getElementById("chat");
		chatDiv.style.display = "none";
	} else {
		//	lets put the current user in our chat avatar background area
		if (currentParticipant != null) {
			currentParticipant.online = true;
			var avatarChatJSON = {
				name: currentParticipant.name,
				fullName: currentParticipant.fullName,
				avatarInfo: currentParticipant.avatar_info,
				x: 26,
				y: 52,
				radius: 15,
				//labelStyle: 'never',
				//orientationHorizontal: "left",
				//orientationVertical: "top",
				colour: currentParticipant.colour,
				//showLabel: false,
				menuRadius:	10,
				paperTopic: paperTopic,
				paper: 	Raphael("chatAvatar")

			}

			thisMain.chatAvatar = new sf.ifs.View.EmotionMenu(avatarChatJSON);
			thisMain.chatAvatar.setEmotion('normal');	//	open the avatars eyes
			thisMain.chatAvatar.draw();
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	lets add ourselves now
	socket.emit('adduser', window.sessionID, currentParticipant.userId, currentParticipant.name);

	var backgroundWidth = paperBackground.canvas.clientWidth ? paperBackground.canvas.clientWidth : paperBackground.width,
		backgroundHeight = paperBackground.canvas.clientHeight ? paperBackground.canvas.clientHeight : paperBackground.height,
		backgroundCenterX = (backgroundWidth / 2),
		backgroundCenterY = (backgroundHeight / 2);

	var canvasWidth = paperCanvas.canvas.clientWidth ? paperCanvas.canvas.clientWidth : paperCanvas.width,
		canvasHeight = paperCanvas.canvas.clientHeight ? paperCanvas.canvas.clientHeight : paperCanvas.height,
		canvasCenterX = (canvasWidth / 2),
		canvasCenterY = (canvasHeight / 2);

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var getWhiteboardJSON = function(size) {
		var result = null;
		switch(size) {
			case "small": {
				if (!isEmpty(window.whiteboard)) {
					if (!isEmpty(window.whiteboard.paint)) {
						window.whiteboard.paint.paint.toBack();
					}
				}
				result = {
					enabled: true,			//	default false
					showControls: false,	//	default false
					scale: (window.whiteboardSmall.width / window.whiteboardLarge.width),		//	default 1.0
					actualScale: 1.0,
					onClick: whiteboardClick,
					zIndex: -1,
					board: {
						strokeWidth: 1,
						radiusInner: 5,
						radiusOuter: 10,
						paper:	paperWhiteboard
					},
					canvas: {
						x: 350,
						y: 103,
						width: window.whiteboardSmall.width,
						height: window.whiteboardSmall.height,
						paper:	paperCanvas
					},
					icon: {
						paper:	paperExpand
					},
					thisMain: thisMain
				}
			}
			break;
			case "large": {
				result = {
					enabled: true,			//	default false
					showControls: true,	//	default false
					scale: (window.whiteboardSmall.width / window.whiteboardLarge.width),
					actualScale: (window.whiteboardSmall.width / window.whiteboardLarge.width),
					onClick: whiteboardClick,
					zIndex: 2,
					board: {
						strokeWidth: 2,
						radiusInner: 9,
						radiusOuter: 18,
						paper:	paperWhiteboard
					},
					canvas: {
						x: 26,
						y: 100,
						width: window.whiteboardLarge.width,
						height: window.whiteboardLarge.height,
						paper:	paperCanvas
					},
					icon: {
						paper:	paperShrink
					},
					thisMain: thisMain
				}
			}
			break;
		}

		return result;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var whiteboardClick = function(direction) {
		var jsonWhiteboard = null;
		switch(direction) {
			case "shrink": {
				jsonWhiteboard = getWhiteboardJSON("small");
			}
			break;
			case "expand": {
				jsonWhiteboard = getWhiteboardJSON("large");
			}
			break;
		}

		if (jsonWhiteboard) {
			thisMain.whiteboard.updateJSON(jsonWhiteboard);
			thisMain.whiteboard.draw();
		}

		thisMain.whiteboard.paint.setCursor("default");
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	[G]	lets draw our white board (small)
	var jsonWhiteboard = getWhiteboardJSON("small");

	thisMain.whiteboard = new sf.ifs.View.Whiteboard(jsonWhiteboard);
	thisMain.whiteboard.draw();

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var getExpandWhiteboard = function(paper, x, y, radius) {
		var result = paper.set();

		//var background = paper.rect(x - 10, y - 10, radius, radius).attr({fill: "#ffd9dc", "stroke-opacity": 0});	//	red
		var background = paper.rect(x - 10, y - 10, radius, radius).attr({fill: "#e0ffe2", "stroke-opacity": 0});	//	green
		var icon = paper.path(getExpandWhiteboardPath).attr({fill: "#3f3f3f", stroke: "#7f7f7f", "stroke-width": 1});
		icon.transform("t" + (x - (radius / 2)) + "," + (y - (radius / 2)));

		result.push(background);
		result.push(icon);

		result.attr({title: "Maximise the Whiteboard"});

		return result;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//	lets display console area
	var json = {
		participants: window.participants,
		thisMain: thisMain,
		paper: paperTopic
	}
	window.topic = new sf.ifs.View.Topic(json);
  socket.emit('gettopics', window.sessionID); //moved from onUserInfo
};
