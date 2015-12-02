var onUpdateavatarcaption = function(userId, sessionId, nameList) {
	//	this should be done for all sessions, not just a particular topic
	if (sessionId != window.sessionID) return;	//	is this the correct topic?

	if (isEmpty(nameList)) return;	//	really need something here...

	//console.log(nameList);

	if (!isEmpty(window.avatars)) {
		for (var ndxAvatars = 0, la = window.avatars.length; ndxAvatars < la; ndxAvatars++) {
			for (var ndxNameList = 0, ln = nameList.length; ndxNameList < ln; ndxNameList++) {
				if (window.avatars[ndxAvatars].json.userId === nameList[ndxNameList].id) {
					window.avatars[ndxAvatars].setCaption(nameList[ndxNameList].caption);
					window.avatars[ndxAvatars].draw();

					break;
				}
			}
		}
	}
};
