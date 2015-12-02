var onDeleteChat = function(userId, topic_id, id, data) {
	var dataAsJSON = [];

	if (!isEmpty(data)) {
		dataAsJSON = JSON.parse(data);
	}

    var table = document.getElementById("chatHistoryTable");
    var element = null;
    var rowIndex = null;

	if (topic_id === thisMain.topicID) {
		if (userId != thisMain.userID) {
			if (dataAsJSON.length > 0) {
				for (var index = 0; index < dataAsJSON.length; index++){
					element = document.getElementById("tag_" + dataAsJSON[index].id);
					if ((dataAsJSON[index].topic_id === topicID) && (element != null)){
						rowIndex = getRowIndex(element);
						table.deleteRow(rowIndex);

						element = null;
						rowIndex = null;
					}
				}
			}
		}
	}

	element = document.getElementById("tag_" + id);
	if (element != null) {
		rowIndex = getRowIndex(element);
    	table.deleteRow(rowIndex);
	}
};
