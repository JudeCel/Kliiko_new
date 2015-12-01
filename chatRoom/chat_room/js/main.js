//-----------------------------------------------------------------------------
//	Client
//	------
//
//	(c) 2011-2014 wavingFree Software
//
//-----------------------------------------------------------------------------
var thisMain = this;

document.body.style.background = BROWSER_BACKGROUND_COLOUR;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var browserDimensions = getBrowserDimensions();

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var paperDashboard = null,
paperDashboardHTML = null,
paperFoundation = null,
paperBackground = null,
paperTopic = null,
paperWhiteboard = null,
paperCanvas = null,
paperHistory = null,
paperChat = null;
paperExpand = null,
paperShrink = null,
paperTitleWhiteboard = null,
paperTitleConversation = null,
paperTextbox = null,
paperTextboxHTML = null,
paperReportbox = null,
paperReportboxHTML = null;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var topic = null,
chat = null,
board = null,
chatHistory = null;

//	hold the last billboard entry made
var lastBillboard = {
  message: null,
  event: null,
  name: null
};

//	array to hold number of unread messages for each topic
var topicChatCounter = new Array(),
topicRepliesCounter = new Array();

var avatars = null;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	lets recent this...
var FINISHED_NONE = 0,
FINISHED_WHITEBOARD = 1,
FINISHED_CHATHISTORY = 2,
FINISHED_LASTSHAREDRESOURCE = 4,
FINISHED_ALL = 7;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var WHITEBOARD_MODE_NONE = 0,				//	default mode
WHITEBOARD_MODE_MOVE = 1,				//	we can move objects
WHITEBOARD_MODE_SCALE = 2;				//	we can delete objects
WHITEBOARD_MODE_ROTATE = 3;				//	we can delete objects
WHITEBOARD_MODE_DELETE = 10;			//	we can delete objects

var whiteboardMode = WHITEBOARD_MODE_NONE;	//	set up our default mode

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var alreadyConnected = false,
initFinished = FINISHED_NONE;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	this is used in on('connect'), if we've received a username then
//	we should refresh, otherwise it's probably a quirk of IE 9 (or less, not sure)
var receivedUsername = false;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	OK, we have our connection to the server
var socket = null;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var participants = null,
topics = null;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var imageMenu = null,
videoMenu = null,
voteMenu = null,
audioMenu = null,
reportMenu = null,
topicMenu = null;

var buildChatHistory = null,
buildWhiteboard = null,
buildBillboard = null,
buildLastSharedResource = null;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	initialise the console
var consoleState = CS_NONE;

var lastWhiteboardImageContent = null,		//	used to update the whiteboard with an image after playback
sendGetPersonalImages = false,			//	update the corkboard after playback?
personalImageContent = null;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var topicID = null,
username = null,
role = 'participant',
topicTitle = '';				//	see playbackFinished

/*
see the brand_projects table for fields within brandProjectsInfo
*/
var brandProjectInfo = {};	//	this will be filled after "getbrandprojectinfo"

/*
see the brand_projects table for fields within brandProjectsInfo
*/
var userInfo = {};	//	this will be filled after "getuserinfo"

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	sometimes "junk" gets tagged to the end of this, such as "...&sid=98/"
//	this just removes some of the common errors...
//	this won't be needed when we move to sessions

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var playbackControl = null;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var dashboard = null;
var textbox = null
var reportbox = null;


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var whiteboardSmall = {
  width: 316,
  height: 153
};

var whiteboardLarge = {
  width: 950,
  height: 460
};

var whiteboardSetup = "drawing";

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	lets start our undo manager
var um = new sf.ifs.View.UndoManager();

function getDashboard() {
  if (!dashboard)
  dashboard = new sf.ifs.View.Dashboard();

  return dashboard;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function resetParticipants() {
  if (isEmpty(participants)) return;	//	 only reset participants if we have some

  for (var ndx = 0, pl = participants.length; ndx < pl; ndx++) {
    if (isEmpty(participants[ndx])) continue;

    participants[ndx].online = false;
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function setOnline(name) {
  if (isEmpty(participants)) return;	//	 only set online participants if we have some

  for (var ndx = 0, pl = participants.length; ndx < pl; ndx++) {
    if (participants[ndx].name === name) {
      participants[ndx].online = true;

      return true;
    }
  }

  return false;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function handleChatKeyPress(e, object) {
  if (isEmpty(object)) return;	//	make sure we have an object first...

  var mode = window.chat.getMode();
  var limit = 999999;	//	set to some ridiculous limit

  if (!isEmpty(mode)) {
    //	lets remove the billboard limit (now we have scrolling)
    //if (mode === "billboard") limit = 300;
  }

  return (object.value.length <= (limit - 1));
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function handleDashboardTitleKeyPress(e, object) {
  if (isEmpty(object)) return;	//	make sure we have an object first...

  var limit = 20;	//	seems like a good limit

  return (object.value.length <= (limit - 1));
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function handleDashboardQuestionKeyPress(e, object) {
  if (isEmpty(object)) return;	//	make sure we have an object first...

  var limit = 40;	//	seems like a good limit

  return (object.value.length <= (limit - 1));
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function doSendMessage(e) {
  var chatObject = document.getElementById("chat");
  var input = chatObject.value;

  chatObject.value = "";
  setCaretPosition(chatObject, 0);

  socket.emit('sendchat', input);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.sendMessage = function (json) {
  //	make sure we have enough information
  if (isEmpty(json)) return;
  if (isEmpty(json.type)) return;

  if (isEmpty(json.message)) {
    socket.emit(json.type);					//	don't need to pass any arguments
  } else {
    if (isEmpty(json.all)) {
      socket.emit(json.type, json.message);
    } else {
      socket.emit(json.type, json.message, json.all);
    }
  }
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.getUserID = function () {
  return window.userID
  // return getUrlVar("id");
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.getParticipantByName = function (name) {
  if (isEmpty(participants)) return;	//	 only set online participants if we have some

  for (var ndx = 0, pl = participants.length; ndx < pl; ndx++) {
    if (participants[ndx].name === name) {
      return participants[ndx];
    }
  }

  return null;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.clearEvents = function () {
  //	we have a stack of events just so we can clear them when needed, no other reason.
  // if (isEmpty(stack)) return;	//	 leave if we have nothing

  // while (stack.length) {
  // 	clearTimeout(stack[0]);
  // 	stack.splice(0, 1);	//	remove this event from the stack
  // }
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.clearWhiteboard = function () {
  if (isEmpty(paperCanvas)) return;

  var localStack = new Array();
  var addToStack = false;
  paperCanvas.forEach(function (el) {
    addToStack = true;
    if (typeof el.data != "undefined") {
      if (typeof el.data("dont_remove") != "undefined") {
        if (el.data("dont_remove") === true) {
          addToStack = false;
        }
      }
    }

    if (addToStack) {
      localStack.push(el);
    }
  });

  for (var ndx = 0, ll = localStack.length; ndx < ll; ndx++) {
    localStack[ndx].remove();
  }
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.clearChats = function () {
  if (isEmpty(chatHistory)) return;

  chatHistory.clearTable();
}

this.clearChat = function() {
  if (isEmpty(chat)) return;

  chat.clear();
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.clearConsole = function () {
  window.topic.getConsole().updateConsole(CS_NONE, {});
};


this.clearBillboard = function () {
  for (var ndx = 0, la = window.avatars.length; ndx < la; ndx++) {
    window.avatars[ndx].reset();
  }

  $('#billboardText').innerHTML = "";
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.setTopic = function (id, initialTopicSet) {
  if (isEmpty(id)) return;
  if (isEmpty(initialTopicSet)) initialTopicSet = true;

  topicID = id;

  this.clearEvents();
  this.clearWhiteboard();
  this.clearChats();
  this.clearChat();
  this.clearConsole();
  this.clearBillboard();

  socket.emit('settopicid', topicID, initialTopicSet, userID);

};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.pause = function () {
  this.clearEvents();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.play = function () {
  this.playbackControl.slider.playbackFromTheCurrentPosition(this.playbackControl.slider);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.setWhiteboardImage = function (content, type) {
  //	make sure we have a topic
  if (isEmpty(topic)) {
    return;
  }

  var ans = confirm("Adding an image will remove all elements from the whiteboard first, this cannot be undone, do you want to Continue?");
  if (ans) {
    thisMain.clearWhiteboard();
    if (!isEmpty(board)) {
      whiteboard.setImage(content, type);
    }
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.setResource = function (content, clearWhiteboard) {
  //	make sure we have a topic
  if (isEmpty(topic)) {
    return;
  }

  var json = null;
  if (typeof content === "string") {
    json = JSON.parse(content);
  } else {
    json = content;
  }

  if (isEmpty(clearWhiteboard)) {
    if (json.content === "delete") {
      clearWhiteboard = false;
    } else {
      clearWhiteboard = true;
    }
  }
  ;

  switch (json.target) {
    case 'console':
    {
      var console = topic.getConsole();

      if (!isEmpty(console)) {
        console.setConsole(json);
      }

      //console.setDocument(json);
    }
    break;
    case 'whiteboard':
    {
      if (clearWhiteboard) thisMain.clearWhiteboard();
      if (!isEmpty(whiteboard)) {
        whiteboard.setResource(json);
      }
    }
    break;
  }
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.deleteResource = function (id) {
  if (!isEmpty(imageMenu)) {
    imageMenu.hide();
  }
  if (!isEmpty(videoMenu)) {
    videoMenu.hide();
  }
  if (!isEmpty(audioMenu)) {
    audioMenu.hide();
  }
  if (!isEmpty(voteMenu)) {
    voteMenu.hide();
  }

  socket.emit('deleteresource', id);
};

this.deleteResourceWithoutHideMenu = function (id) {

  socket.emit('deleteresource', id);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.setResourceDuringPlayback = function (content) {
  //	make sure we have a topic
  if (isEmpty(topic)) {
    return;
  }

  var json = null;
  if (typeof content === "string") {
    json = JSON.parse(content);
  } else {
    json = content;
  }

  switch (json.target) {
    case 'console':
    {
      var console = topic.getConsole();

      if (!isEmpty(console)) {
        console.setConsole(json);
      }

      //console.setDocument(json);
    }
    break;
    case 'whiteboard':
    {
      if (!((json.content === "delete") && (json.type === "image"))) {
        thisMain.clearWhiteboard();
      }
      window.lastWhiteboardImageContent = json;		//	when we have finished playing back, lets update the whiteboard with this
      //window.sendGetPersonalImages = false;			//	make sure this is off
    }
    break;
  }
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.setTableDocument = function (content, type) {
  //	make sure we have a topic
  if (isEmpty(topic)) {
    return;
  }

  var console = topic.getConsole();

  console.setDocument(content, type);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.unsetTableDocument = function () {
  //	make sure we have a topic
  if (isEmpty(topic)) {
    return;
  }

  var console = topic.getConsole();

  console.unsetDocument();
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.removeTableDocument = function () {
  socket.emit('removedocument');

  thisMain.unsetTableDocument();
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.imageMenuCleanup = function () {
  if (isEmpty(imageMenu)) {
    return;
  }

  imageMenu.destroy();
  imageMenu = null;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.videoMenuCleanup = function () {
  if (isEmpty(videoMenu)) {
    return;
  }

  videoMenu.destroy();
  videoMenu = null;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.audioMenuCleanup = function () {
  if (isEmpty(audioMenu)) {
    return;
  }

  audioMenu.destroy();
  audioMenu = null;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.voteMenuCleanup = function () {
  if (isEmpty(voteMenu)) {
    return;
  }

  voteMenu.destroy();
  voteMenu = null;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.topicMenuCleanup = function () {
  if (isEmpty(topicMenu)) {
    return;
  }

  topicMenu.destroy();
  topicMenu = null;
};

//----------------------------------------------------------------------------
// this.sendShareResourceAfterDrag = function(json) {
// 	//	firstly, we want to make sure our pictureboard is closed
// 	if (window.consoleState & window.CS_PICTUREBOARD) {
// 		socket.emit('setpersonalimages', {
// 			id: -1,
// 			type: 'pictureboard',
// 			content: "false"
// 		});
// 	}
//
// 	socket.emit('shareresource', json);
// };

this.videoMenuResourceOnUp = function (json) {
  thisMain.videoMenu.hide();

  //socket.emit('shareresource', json);
  //window.sendShareResourceAfterDrag(json);
  //window.topic.getConsole().setConsole(json);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.audioMenuResourceOnUp = function (json) {
  thisMain.audioMenu.hide();

  //socket.emit('shareresource', json);
  //window.sendShareResourceAfterDrag(json);
  //window.topic.getConsole().setConsole(json);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.imageMenuResourceOnUp = function (json, hide) {
  if (isEmpty(hide)) {
    hide = true;
  }

  if (hide) thisMain.imageMenu.hide();

  socket.emit('shareresource', json);
  //window.sendShareResourceAfterDrag(json);
  //window.topic.getConsole().setConsole(json);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.voteMenuResourceOnUp = function (json) {
  thisMain.voteMenu.hide();

  //	lets make sure we create a vote event
  //json.updateEvent = true;

  //window.topic.getConsole().setConsole(json);
};

//----------------------------------------------------------------------------
this.shareResource = function (json) {
  socket.emit('shareresource', json);
};

//----------------------------------------------------------------------------
this.setChatBackgroundColour = function (name, colourAsDecimal, chatHistoryIndex) {
  if (isEmpty(chat)) {
    return;
  }

  var colourAsHex = colourToHex(colourAsDecimal);

  chat.setBackgroundColour(name, colourAsHex, chatHistoryIndex);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	set up our event handlers
this.handleConsoleImage = function () {
  if (role === "facilitator" || role === "observer") {
    window.dashboard.showMessage({
      message: {
        text: "Only Participants can upload images from here",
        attr: {
          'font-size': 24,
          fill: "white"
        }
      },
      dismiss: {
      },
      showClose: true,
      zIndex: 9
    }, function (value) {
      window.dashboard.toBack();		//	time to hide the dashboard
    });
  } else {
    var html = '<form id="formUploadCollage" method="post" action="/uploadcollage" enctype="multipart/form-data" target="iFrameUploadCollage">' +
    '	<div style="position:relative; left:0px; top:0px; width:0px; height: 0px;">' +
    '		<div style="position:absolute; left:80px; top:300px; width:200px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
    '			<input id="IDUploadImageTitle" placeholder="Enter a title here" title="Enter a title here" onkeypress="return window.handleDashboardTitleKeyPress(event, this);" style="font-size: 24px;">' +
    '		</div>' +
    '		<div style="position:absolute; left:80px; top:360px; width:200px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand; visibility: hidden; display: none;">' +
    '			<input id="IDUploadImageText" style="font-size: 24px;">' +
    '		</div>' +
    '		<span style="position:absolute; left:300px; top:300px; width:320px; height: 40px;  filter:alpha(opacity=0.0); opacity:0.0; overflow:hidden; cursor:hand;">' +
    '			<input type="file" id="IDUploadCollageHidden" name="uploadedfile" onchange="window.checkImageFileExtension(this, \'formUploadCollage\', \'IDUploadImageTitle\', \'IDUploadImageText\')" style="font-size: 50px;">' +
    '		</span>' +
    '	</div>' +
    '	<iframe id="iFrameUploadCollage" name="iFrameUploadCollage" src="' + window.URL_PATH + window.SERVER_PATH + 'html/iFrame.html" style="visibility: hidden; display: none;">' +
    '	</iframe>' +
    '</form>';

    var json = {
      formID: "formUploadCollage",
      titleID: "IDUploadImageTitle",
      textID: "IDUploadImageText"
    }

    window.dashboard.toFront();
    window.dashboard.setBrowseForImage(html, json);
    window.dashboard.close();
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.handleConsoleVideo = consoleVideoHandler;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.handleConsoleAudio = function () {
  var consoleDocument = topic.getConsole().consoleDocument;

  if (!isEmpty(consoleDocument)) {
    //var audioURL = "<a href=\"" + consoleDocument + "\">Click here to play the audio track</a>";

    window.dashboard.audioPlayerToFront();
    //window.dashboard.toFront();
    window.dashboard.audioClose();

    $("#jquery_jplayer_audio").jPlayer({
      ready: function () {
        $(this).jPlayer("setMedia", {
          mp3: consoleDocument
        });
      },
      swfPath: window.URL_PATH + window.CHAT_ROOM_PATH + "resources/jPlayer",
      supplied: "mp3",
      cssSelectorAncestor: "#jp_container_2"	//	allows for multiple instances...
    });
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.handleConsoleVote = function () {
  var consoleDocument = topic.getConsole().consoleDocumentVote;
  var consoleDocumentId = topic.getConsole().consoleDocumentVoteId;

  if (role === "facilitator" || role === "observer") {
    socket.emit('enqueryvote', consoleDocumentId, true);
  } else {
    socket.emit('enqueryvote', consoleDocumentId, false);
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.handleConsoleVoteMore = function () {
  var consoleDocument = topic.getConsole().consoleDocumentVote;
  var consoleDocumentId = topic.getConsole().consoleDocumentVoteId;

  if (!isEmpty(consoleDocument)) {
    var jsonAsString = decodeURI(consoleDocument);
    //console.log(jsonAsString);
    var json = JSON.parse(jsonAsString);

    json.id = consoleDocumentId;

    var html = topic.getConsole().getForm(json);
    json.html = html;

    window.dashboard.setVoteJSON(json);
    window.dashboard.toFront();
    window.dashboard.close();
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.handleConsoleVoteResult = function (result) {
  var consoleDocument = topic.getConsole().consoleDocumentVote;
  var consoleDocumentId = topic.getConsole().consoleDocumentVoteId;
  var voteJson = processVoteResult(result);

  if (!isEmpty(consoleDocument) && voteJson != null) {
    var jsonAsString = decodeURI(consoleDocument);
    var json = JSON.parse(jsonAsString);

    json.voteStatus = voteJson.voteStatus;
    json.id = consoleDocumentId;
    json.html = null;

    window.dashboard.setVoteResultJSON(json);
    window.dashboard.toFront();
    window.dashboard.close();
  }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
this.updateAvatar = function (me) {
  //	firstly, lets find the avatar to change...
  for (var ndx = 0, na = topic.avatar.length; ndx < na; ndx++) {
    if (topic.avatar[ndx].json.userId === userID) {
      //	OK, we have the avatar, lets change it
      topic.avatar[ndx].manifestation.head = me.manifestation.head;
      topic.avatar[ndx].manifestation.hair = me.manifestation.hair;
      topic.avatar[ndx].manifestation.accessory = me.manifestation.accessory;
      topic.avatar[ndx].manifestation.desk = me.manifestation.desk;
      topic.avatar[ndx].manifestation.face = me.manifestation.face;
      topic.avatar[ndx].manifestation.top = me.manifestation.top;

      topic.avatar[ndx].manifestation.draw();

      break;
    }
  }
}

//----------------------------------------------------------------------------
//	this is the last thing done when we are initialising the IFS chat room
this.playbackFinished = function () {
  dashboard.toBack();

  if (!isEmpty(lastWhiteboardImageContent)) {
    window.setResource(lastWhiteboardImageContent, false);

    lastWhiteboardImageContent = null;
  }

  window.onTopicsUpdateTopic({
    userID: window.userID,
    topicID: window.topicID,
    label: window.topicTitle || ""
  });
}

//----------------------------------------------------------------------------
//  main
//----------------------------------------------------------------------------
function init() {
  //if this is defined, the lets remove it first...
  if (paperDashboard) {
    paperDashboard.remove();
  }
  if (paperFoundation) {
    paperFoundation.remove();
  }
  if (paperBackground) {
    paperBackground.remove();
  }
  if (paperTopic) {
    paperTopic.remove();
  }
  if (paperWhiteboard) {
    paperWhiteboard.remove();
  }
  if (paperCanvas) {
    paperCanvas.remove();
  }
  if (paperHistory) {
    paperHistory.remove();
  }
  if (paperChat) {
    paperChat.remove();
  }

  if (paperExpand) {
    paperExpand.remove();
  }
  if (paperShrink) {
    paperShrink.remove();
  }
  if (paperTitleWhiteboard) {
    paperTitleWhiteboard.remove();
  }
  if (paperTitleConversation) {
    paperTitleConversation.remove();
  }
  if (paperTextbox) {
    paperTextbox.remove();
  }
  if (paperReportbox) {
    paperReportbox.remove();
  }
  ;

  var inputHeight = 200;
  var topMargin = 50;

  var chatAreaMarginTop = 10;
  var chatAreaRadius = 12;

  //----------------------------------------------------------------
  //	create our papers
  //paperHeader = Raphael("header");
  paperDashboard = Raphael("dashboard");
  paperDashboardHTML = Raphael("dashboard-html");
  paperFoundation = Raphael("foundation");
  paperBackground = Raphael("background");
  paperTopic = Raphael("topic");
  paperTopicMenu = null;
  paperWhiteboard = Raphael("whiteboard");
  paperCanvas = ScaleRaphael("canvas", 950, 460);

  paperTitleWhiteboard = Raphael("title-whiteboard");
  paperTitleConversation = Raphael("title-conversation");

  paperTextbox = Raphael("textbox");
  paperTextboxHTML = Raphael("textbox-html");

  //window.textbox = new sf.ifs.View.Textbox();

  paperReportbox = Raphael("reportbox");
  paperReportboxHTML = Raphael("reportbox-html");
  window.reportbox = new sf.ifs.View.Reportbox({
    type: 'PDF'
  });

  //----------------------------------------------------------------
  //	lets draw our menu lines and separators
  paperBackground.path("M 25 75 L 975 75").attr({fill: 'none', stroke: BORDER_COLOUR, 'stroke-width': 2});
  paperBackground.path("M 790 15 L 790 65").attr({fill: 'none', stroke: BORDER_COLOUR, 'stroke-width': 2, 'stroke-dasharray': '.'});

  //----------------------------------------------------------------
  //	lets draw our chat chatHistory area
  paperHistory = Raphael("chatHistory");

  var chatHistoryJSON = {
    radius: chatAreaRadius,
    thisMain: thisMain,
    paper: paperHistory
  };

  chatHistory = new sf.ifs.View.History(chatHistoryJSON);
  chatHistory.draw();

  //----------------------------------------------------------------
  //	set up our canvas_container div
  //	set up our dimensions and so on for the canvas
  var canvasWidth = paperFoundation.canvas.clientWidth ? paperFoundation.canvas.clientWidth : paperFoundation.width,
  canvasHeight = paperFoundation.canvas.clientHeight ? paperFoundation.canvas.clientHeight : paperFoundation.height,
  canvasCenterX = (canvasWidth / 2),
  canvasCenterY = (canvasHeight / 2);

  //	lets add a boarder
  var canvasBorder = paperFoundation.path(getRoundedRectToPath(5, 5, (canvasWidth - 8), (canvasHeight - 8), chatAreaRadius));
  canvasBorder.attr({fill: BACKGROUND_COLOUR, stroke: BORDER_COLOUR, "stroke-width": 3, "stroke-opacity": 1});

  //----------------------------------------------------------------
  //	lets draw our emoticon area
  paperEmoticons = Raphael("emoticons");

  var emoticonsJSON = {
    radius: chatAreaRadius,
    marginTop: chatAreaMarginTop,
    thisMain: thisMain,
    paper: paperEmoticons
  }

  emoticons = new sf.ifs.View.Emoticons(emoticonsJSON);
  emoticons.draw();

  //----------------------------------------------------------------
  //	lets draw our chat area
  paperChat = Raphael("chat");

  var chatJSON = {
    radius: chatAreaRadius,
    marginTop: chatAreaMarginTop,
    thisMain: thisMain,
    paper: paperChat
  }

  chat = new sf.ifs.View.Chat(chatJSON);
  chat.draw();

  //----------------------------------------------------------------
  //	set up our icons
  paperExpand = Raphael("expand");
  paperShrink = Raphael("shrink");
}

function setSocketEvents() {
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //	setup listeners

  //	this is the first object receieved after launch
  socket.on('brandprojectinfo', onBrandprojectinfo);
  socket.on('userinfo', onUserinfo);

  socket.on('updateusers', onUpdateusers);
  socket.on('updatedemotions', onUpdatedemotions);
  socket.on('updatechat', onUpdatechat);
  socket.on('updatechatcontent', onUpdateChatContent);

  socket.on('updateBillboard', onUpdateBillboard);
  socket.on('participants', onParticipants);
  socket.on('resources', onResources);
  socket.on('resourceappended', onResourceAppended);
  socket.on('topics', onTopics);
  socket.on('topicset', onTopicset);
  socket.on('updateavatarcaption', onUpdateavatarcaption);
  socket.on('personalimagesset', onPersonalimagesset);
  socket.on('sharedresource', onSharedresource);
  socket.on('updatecanvas', onUpdatecanvas);
  socket.on('updateavatarinfo', onUpdateavatarinfo);
  socket.on('offlinetransactions', onOfflinetransactions);
  socket.on('username', onUsername);
  socket.on('alreadyconnected', onAlreadyconnected);

  socket.on('updateundo', onUpdateUndo);
  socket.on('updateredo', onUpdateRedo);
  socket.on('updateboardevent', onUpdateBoardEvent);
  socket.on('deletedchat', onDeleteChat);
  socket.on('enqueryvotereturn', onEnqueryVoteReturn);
  socket.on('showreportbox', onShowReportBox);
  socket.on('savepdffile', onSavePDFFile);
  socket.on('deletedobject', onDeletedObject);
  socket.on('updatethumbsup', onThumbsup);
  socket.on('updatepictureboard', onUpdatepictureboard);


  socket.on('error_nosessionid', onNoSessionID);

  /*
  json = {
  saveAs: string,
  urlPath: string
}
*/
socket.on('savedreport', function (json) {
  window.dashboard.toBack();

  if (isEmpty(json)) return;

  json = JSON.parse(json, null);
  if (isEmpty(json)) return;
  if (isEmpty(json.urlPath)) return;

  window.dashboard.report(json, true);	//	 don't bring to dashboard to front, it's already there
});

socket.on('showvoteedit', onShowVoteEdit);

//	uploading of files
socket.on('submitform', onSubmitform);
socket.on('fileuploadcomplete', onFileuploadcomplete);

socket.on('chats', function (data) {
  if (window.buildChatHistory) {
    window.buildChatHistory.processChatHistory(data);
  }
});

socket.on('objects', function (data) {
  if (window.buildWhiteboard) {
    window.buildWhiteboard.processWhiteboard(data);
  }
});

socket.on('topicLoaded', function (data) {
  if (window.buildBillboard) {
    window.buildBillboard.processBillboard(data);
  }
});

socket.on('updatedconsole', function (topic_id, consoleState, json) {
  if (!isEmpty(window.topic)) {
    if (topic_id === window.topicID) {
      window.topic.getConsole().updateConsole(consoleState, json);
    }
  }
});

socket.on('lastsharedresources', function (data) {
  if (window.buildLastSharedResource) {
    window.buildLastSharedResource.processLastSharedResource(data);
  }
});

socket.on('disconnect', function () {
  if (!window.alreadyConnected) {
    window.getDashboard().showMessage({
      message: {
        text: "Just a moment...",
        attr: {
          'font-size': 24,
          fill: "white"
        }
      },
      dismiss: {
      },
      showClose: false,
      zIndex: 9
    }, function (value) {
      window.getDashboard().toBack();		//	time to hide the dashboard
    });
  }
});

socket.on('connect_failed', function () {
  window.dashboard.showMessage({
    message: {
      text: "The Connection has failed\n \nPlease reload this page...",
      attr: {
        'font-size': 24,
        fill: "white"
      }
    },
    dismiss: {
    },
    showClose: false,
    zIndex: 9
  }, function (value) {
    window.dashboard.toBack();		//	time to hide the dashboard
  });
});
}

/*
config = config.json
*/
function main(config) {
  var sessionID = window.sessionID;
  var userID = window.userID;
  
  //	lets process config
  MODE = config.mode;

  port = config.port;
  domain = config.domain;
  FS_PATH = config.paths.fsPath;
  URL_PATH = config.paths.urlPath;
  SERVER_PATH = config.paths.serverPath;
  CONFIG_PATH = config.paths.configPath;
  ADMIN_PATH = config.paths.adminPath;
  CHAT_ROOM_PATH = config.paths.chatRoomPath;

  // socket = io.connect("http://" + domain + ':' + port, {
  socket = io.connect('insider.focus.com:7203/chat', {
    'reconnect': true,
    'reconnection delay': 500,
    'max reconnection attempts': 10
  });

  init();
  setSocketEvents();

  //	these don't seem to be run when the socket first connects
  socket.on('connect', function () {
    //	if we've received the username, then this 'connect' must be after
    //	we have lost connection to the server...
    if (receivedUsername) {
      location.reload();
    }
  });
  socket.emit('getbrandprojectinfo', sessionID);
}

window.onresize = function () {
  browserDimensions = getBrowserDimensions();
};
