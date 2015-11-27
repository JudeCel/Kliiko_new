//-----------------------------------------------------------------------------
function divTagBegin(argumentsJSON) {
	var result = "<div ";
	if (isEmpty(argumentsJSON.className)) return result;
	return result + "class=\"" + argumentsJSON.className + "\" ";
}

function divTagId(argumentsJSON) {
	if (isEmpty(argumentsJSON.tagId)) return "";
	return "id=\"" + argumentsJSON.tagId + "\" ";
}

function divTagTitle(argumentsJSON) {
	if (isEmpty(argumentsJSON.title)) return "";
	return "title=\"" + argumentsJSON.title + "\" ";
}

function divTagEnd() {
	return ">";
}

function divTagStyle(argumentsJSON) {
	var result = "";
	if ((isEmpty(argumentsJSON.style)) && (isEmpty(argumentsJSON.width)) && (isEmpty(argumentsJSON.height)) && (isEmpty(argumentsJSON.isInline))) return result;

	result = "style=\"";
	
	if (!isEmpty(argumentsJSON.style)) result = result + argumentsJSON.style + ";";
	if (!isEmpty(argumentsJSON.width)) result = result + "width: " + argumentsJSON.width + "px;";
	if (!isEmpty(argumentsJSON.height)) result = result + "min-height: " + argumentsJSON.height + "px;";

	if (isEmpty(argumentsJSON.isInline)) argumentsJSON.isInline = false;
	if (argumentsJSON.isInline) {
		result = result + "display: inline;";
	}
	
	result = result + "\" ";
	
	return result; 
}

function divTagOnClick(argumentsJSON) {
	if (isEmpty(argumentsJSON.onClick)) return "";
	return "onclick=\"" + argumentsJSON.onClick + "\" "; 
}

function divTag(argumentsJSON) {
	return divTagBegin(argumentsJSON) + divTagId(argumentsJSON) + divTagStyle(argumentsJSON) + divTagOnClick(argumentsJSON) + divTagTitle(argumentsJSON) + divTagEnd();
}

//-----------------------------------------------------------------------------
function JSONtoHTML(json) {
	//	should we hide this DIV?
	var hide = false;
	if (!isEmpty(json.hide)) hide = json.hide;
	if (hide) return "";

	//	do we have any content?
	if (isEmpty(json.content)) json.content = "";
	
	//	lets opening DIV tag, which includes the id, class and styles
	var result = divTag(json);

	//	if this DIV has any children, lets display them too
	if (!isEmpty(json.items)) {
		for (var ndx = 0, ni = json.items.length; ndx < ni; ndx++) {
			result = result + JSONtoHTML(json.items[ndx]);
		}
	}
	
	//	lets add the content and the closing DIV now
	return result + json.content + "</div>";
}