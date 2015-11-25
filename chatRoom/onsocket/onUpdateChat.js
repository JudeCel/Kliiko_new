var onUpdatechat = function(user_id, topic_id, data) {
	if (!isEmpty(topic)) {
		var avatar = topic.getAvatarByUserId(user_id),
			avatarJSON = avatar.json;
	}

	if (topicID === topic_id) {
		if (!isEmpty(chatHistory)) {
			if (!isEmpty(topic)) {
				for (var ndx = 0, pl = participants.length; ndx < pl; ndx++) {
					if (avatarJSON.name === participants[ndx].name) {
						var now = new Date();
						var json = {
							input: data.input,
							emotion: data.emotion,
							date: now,
							id: data.id,
							tag: 0
						}
						
						if (!isEmpty(data.mode)) {
							if (!isEmpty(data.mode.messageId)) {
								json.replyId = data.mode.messageId;
								json.replyUserId = data.mode.replyTo;
								json.replyDate = now;
								json.emotion = data.emotion;
							}
						}
						
						//	lets update the chat history area
						if (isEmpty(data.animate)) data.animate = false;

						var billboardMode = false;
						if (avatarJSON.role === "facilitator") {
							if (typeof data.mode != "undefined") {
								if (data.mode.type === "billboard") {
									billboardMode = true;
								}
							}
							//	topic.say(username, data, now.format("yyyy-mm-dd HH:MM:ss"));
						}

						if (billboardMode) {
							avatar.say(data, now);
							window.lastBillboard.message = data.input;
							if ((window.role === 'facilitator') || (window.role === 'co-facilitator')) {
								chatHistory.addChat(avatarJSON, json, ndx, data.animate);
							}
						} else {
							chatHistory.addChat(avatarJSON, json, ndx, data.animate);
						}

						avatar.setEmotion(data.emotion);
						avatar.draw();

						avatar.highlight();

						break;
					}
				}
			}
		}

		//	notifiy the user that someone has chatted
		if (user_id != window.userID) {
			playSound(window.URL_PATH + window.CHAT_ROOM_PATH + "resources/sounds/chat_notification.mp3");
		}
	} else {
		//	is this a reply?
		var isReply = false;

		if (!isEmpty(data.mode)) {
			if (!isEmpty(data.mode.replyTo)) {
				if (data.mode.replyTo === window.userID) {
					isReply = true;
				}
			}
		}

		if (isReply) {
			if (isEmpty(window.topicRepliesCounter['topic_' + topic_id])) {
				window.topicRepliesCounter['topic_' + topic_id] = {
					count: 0,
					ids: []
				}
			}

			window.topicRepliesCounter['topic_' + topic_id].count = (window.topicRepliesCounter['topic_' + topic_id].count + 1);
			window.topicRepliesCounter['topic_' + topic_id].ids.push(data.mode.messageId)
		} else {
			if (isEmpty(window.topicChatCounter['topic_' + topic_id])) {
				window.topicChatCounter['topic_' + topic_id] = {
					count: 0,
					ids: []
				}
			}

			window.topicChatCounter['topic_' + topic_id].count = (window.topicChatCounter['topic_' + topic_id].count + 1);
			window.topicChatCounter['topic_' + topic_id].ids.push(data.id)
		}

		window.onTopicsUpdateTopic({
			userID: user_id,				//	make sure we update with the user
			topicID: topic_id
		});

		if (!isEmpty(avatar)) {
			avatar.highlight();
		}
	}
};
