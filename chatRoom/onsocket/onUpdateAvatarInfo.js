/*
	data = {
		userid: int,
		avatarinfo: string 				//	"head:face:hair:top:accessory:desk", i.e., 0:4:8:9:10:11 (see users table)
	}
*/
var onUpdateavatarinfo = function(sessionId, userId, data) {
	//	this should be done for all sessions, not just a particular topic
	if (isEmpty(sessionId)) return;
	if (sessionId != window.sessionID) return;	//	is this the correct topic?

	if (isEmpty(window.topic)) return;
	
	if (isEmpty(userId)) return;
	if (isEmpty(data)) return;
	if (isEmpty(data.avatarinfo)) return;

	//	default values where we can
	if (isEmpty(data.userid)) data.userid = userId;

	//	this is broadcast to everyone, but the user has already updated the avatar
	if (data.userid === window.userID) return;

	if (window.avatars === null) {
		window.avatars = window.topic.getAvatars();
	} 

	//	first, lets make sure our avatars are asleep
	for (var ndxAvatars = 0, la = window.avatars.length; ndxAvatars < la; ndxAvatars++) {
		if (data.userid === window.avatars[ndxAvatars].json.userId) {					
			//	OK, we found our avatar, lets update it
			var attributes = data.avatarinfo.split(":");

			//window.avatars[ndxAvatars].setRawHead = attributes[0];
			//window.avatars[ndxAvatars].setRawFace = attributes[1];
			window.avatars[ndxAvatars].manifestation.setRawHair(attributes[2]);
			window.avatars[ndxAvatars].manifestation.setRawTop(attributes[3]);
			window.avatars[ndxAvatars].manifestation.setRawAccessory(attributes[4]);
			window.avatars[ndxAvatars].manifestation.setRawDesk(attributes[5]);

			window.avatars[ndxAvatars].manifestation.draw();

			break;	//	we are done, lets get out of here...
		}
	}
};