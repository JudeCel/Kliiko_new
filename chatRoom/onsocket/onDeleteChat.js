var onDeleteChat = function(userId, topicId, id, data) {
	var dataAsJSON = [];

	if (!isEmpty(data)) {
		dataAsJSON = JSON.parse(data);
	}

    var table = document.getElementById("chatHistoryTable");
    var element = null;
    var rowIndex = null;

	if (topicId === thisMain.topicID) {
		if (userId != thisMain.userID) {
			if (dataAsJSON.length > 0) {
				for (var index = 0; index < dataAsJSON.length; index++){
					element = document.getElementById("tag_" + dataAsJSON[index].id);
					if ((dataAsJSON[index].topicId === topicID) && (element != null)){
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
