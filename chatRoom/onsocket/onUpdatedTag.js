var onUpdatedTag = function(userId, topicId, tag_value){
	var tag_id = "tag_" + userId;
	var row_id = "tr_" + userId;

	var element = document.getElementById(tag_id);
	switch(tag_value){
	case 0:
		element.setAttribute("class", "chatTag tag_unset");
		break;
	case 1:
		element.setAttribute("class", "chatTag tag_set");
		break;
	}

	var row = document.getElementById(row_id);
	row.tag = tag_value;
}