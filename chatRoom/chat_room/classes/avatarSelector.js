var view = namespace('sf.ifs.View');

/*
	json = {
		id:				string,		//	default this.id
		injectInto: 	string,		//	default ""
		objects:		string,		//	default []
		orientation:	string,		//	default 'vertical'	'vertical' | 'horizontal'
		displayNumber: 	int,		//	default 1,
		width:			int,		//	default 100
		height:			int,		//	default 100
		offsetX:		int,		//	default 0 
		offsetY:		int,		//	default 0
		scale:			float		//	default 1.0
	}
*/
view.AvatarSelector = function (json) {
	this.width = 120;
	this.height = 100;

	//	first check json as a while
	if (isEmpty(json))	{
		json.id = this.id;
		json.injectInto = "";
		json.objects = [];
		json.orientation = 'vertical';
		json.displayNumber = 1;
		json.width = 120;
		json.height = 100;
		json.offsetX = 0;
		json.offsetY = 0;
		json.scale = 1.0;		

	} else {
		json.id = (!isEmpty(json.id)) ? json.id : this.id;
		json.injectInto = (!isEmpty(json.injectInto)) ? json.injectInto : "";
		json.objects = (!isEmpty(json.objects)) ? json.objects : [];
		json.orientation = (!isEmpty(json.orientation)) ? json.orientation : 'vertical';
		json.displayNumber = (!isEmpty(json.displayNumber)) ? json.displayNumber : 1;
		json.width = (!isEmpty(json.width)) ? json.width : 100;
		json.height = (!isEmpty(json.height)) ? json.height : 100;
		json.offsetX = (!isEmpty(json.offsetX)) ? json.offsetX : 0;
		json.offsetY = (!isEmpty(json.offsetY)) ? json.offsetY : 0;
		json.scale = (!isEmpty(json.scale)) ? json.scale : 1.0;
	}

	this.json = json;

	var html = this.getHTML();
	var testAvatarSelector = document.getElementById(this.json.injectInto);
	testAvatarSelector.appendChild(html);

	this.renderObjects();
};


view.AvatarSelector.prototype.getHTML = function () {
	var result = document.createElement('div');
	var width = this.json.width;
	var height = this.json.height;
	if (this.json.orientation === 'vertical') {
		height = height * this.json.displayNumber;
		width = width + 17;
	} else {
		width = width * this.json.displayNumber;
		height = height + 20;
	}
	var style = "float:left; width:" + width + "px; height:" + height + "px; margin-left: " + this.json.offsetX + "px; overflow:auto; white-space: nowrap;"
	result.setAttribute('id', 'ac_' + this.json.id);
	result.setAttribute('style', style);
	var element = null;
	var elementId = null;
	var paper = null;
	var innerElement = (this.json.orientation === 'vertical') ? 'div' : 'span';
	for (var ndx = 0, nobjs = this.json.objects.length; ndx < nobjs; ndx++) {
		element = document.createElement(innerElement);
		elementId = 'ac_element_' + this.json.id + '_' + ndx;
		element.setAttribute('id', elementId);
		element.setAttribute('style', 'width:' + this.json.width + 'px; height:' + this.json.height + 'px;');
		result.appendChild(element);
	}

	return result;
}

view.AvatarSelector.prototype.renderObjects = function() {
	var paper = null;

	var elementId = null;
	for (var ndx = 0, nobjs = this.json.objects.length; ndx < nobjs; ndx++) {
		elementId = 'ac_element_' + this.json.id + '_' + ndx;
		paper = Raphael(elementId);
		paper.setViewBox(0, 0, (this.json.width * (this.width / this.json.width)), (this.json.height * (this.height / this.json.height)), false);

		//	do we need to show the head?
		if (!isEmpty(this.json.showHead)) {
			heads[this.json.showHead](paper);
		}

		//	do we need to show an emotion?
		if (!isEmpty(this.json.showFace)) {
			faces[this.json.showFace](paper);
		}

		//	do we need to show hair?
		if (!isEmpty(this.json.showHair)) {
			hairs[this.json.showHair](paper);
		}

		//	do we need to show a top?
		if (!isEmpty(this.json.showTop)) {
			tops[this.json.showTop](paper);
		}

		//	do we need to show an accessory?
		if (!isEmpty(this.json.showAccessory)) {
			accessories[this.json.showAccessory](paper);
		}

		//	do we need to show a desk item?
		if (!isEmpty(this.json.showDesk)) {
			desks[this.json.showDesk](paper);
		}

		//	now show the object in question
		this.json.objects[ndx](paper);

	}
}