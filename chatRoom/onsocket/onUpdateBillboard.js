var onUpdateBillboard = function(userId, topic_id, data) {
	if (isEmpty(topic)) return;
	var avatar = topic.getAvatarByUserId(userId);
	var avatarJSON = avatar.json;

	if (topicID !== topic_id || avatarJSON.role !== "facilitator") return;

	if (!isEmpty(chatHistory)) {
		for (var ndx = 0, pl = participants.length; ndx < pl; ndx++) {
			if (avatarJSON.name === participants[ndx].name) {
				var now = new Date();

				avatar.draw();
				avatar.highlight();

				var billboardText = document.getElementById("billboardText");
				billboardText.innerHTML = data;
				break;
			}
		}
	}

	//	notifiy the user that someone has chatted
	if (userId != window.userID) {
		playSound(window.URL_PATH + window.CHAT_ROOM_PATH + "resources/sounds/chat_notification.mp3");
	}

};
