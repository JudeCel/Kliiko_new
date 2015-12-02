
var onOfflinetransactions = function(data) {
	if (!isEmpty(data)) {
		try {
			var json = JSON.parse(data, null);

			//	if we are still here, then no exception was raised...
			for (ndx = 0, jl = json.length; ndx < jl; ndx++) {
				var topicId = json[ndx].topicId,
					messageId = json[ndx].message_id;

				//	make sure we reset our unread replies
				if (isEmpty(window.topicRepliesCounter['topic_' + topicId])) {
					window.topicRepliesCounter['topic_' + topicId] = {
						count: 0,
						ids: [] 
					};
				}

				//	window.topicRepliesCounter['topic_' + topicId] = (window.topicRepliesCounter['topic_' + topicId] + 1);
				window.topicRepliesCounter['topic_' + topicId].count = (window.topicRepliesCounter['topic_' + topicId].count + 1);
				window.topicRepliesCounter['topic_' + topicId].ids.push(messageId);
			}
		} catch (e) {
			//
		}
	}
};
