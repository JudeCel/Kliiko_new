//----------------------------------------------------------------------------
//	we need to put this in a better place, but for now...
Raphael.el.is_visible = function() {
	return (this.node.style.display !== "none");
}

//----------------------------------------------------------------------------
var distanceJSON = {
	default: 1.0,
	sizes: [{
		size: 50,
		distance: 4.0
	},{
		size: 60,
		distance: 3.0
	},{
		size: 100,
		distance: 2.0
	}]
};

var	scale = null;
var rotate = null;

//----------------------------------------------------------------------------
//	this is only good for a free transform object
//	returns true if the object was updated, otherwise false
function updatePathForObject(object, x, y) {
	if (isEmpty(object)) return false;
	if (isEmpty(object.attrs)) return false;

	var useSubject = true;
	if (isEmpty(object.subject)) useSubject = false;

	var pl = 0;
	var type = null;
	if (useSubject) {
		if (isEmpty(object.subject.message)) return false;
		if (isEmpty(object.subject.message.type)) return false;

		type = object.subject.message.type;
		if (!isEmpty(object.subject.message.path)) {
			pl = object.subject.attrs.path.length;
		}
	} else {
		if (isEmpty(object.message)) return false;
		if (isEmpty(object.message.type)) return false;

		type = object.message.type;
		if (!isEmpty(object.message.path)) {
			pl = object.attrs.path.length;
		}
	}


	if (isEmpty(x)) return false;
	if (isEmpty(y)) return false;

	var updated = false;

	if (!((x === 0) && (y === 0))) {
		updated = true;

		switch(type) {
			case 'circle':
			case 'circle-fill': {
				//	we need to move the circle's centre
				var para = (useSubject) ? object.subject.message.para : object.message.para;
				//	only continue if the para looks right
				if (para.length === 3) {
					para[0] = para[0] + x;
					para[1] = para[1] + y;
				}
			}
			break;
			case 'text':
			case 'text-box': {
				//	we need to move the circle's centre
				var para = (useSubject) ? object.subject.message.para : object.message.para;
				//	only continue if the para looks right
				if (para.length === 3) {
					para[0] = para[0] + x;
					para[1] = para[1] + y;
				}
			}
			break;
			default: {
				for (var ndx = 0; ndx < pl; ndx++) {
					if (useSubject) {
						if (object.subject.attrs.path[ndx][0].toLowerCase() != "z") {
							object.subject.attrs.path[ndx][1] = object.subject.attrs.path[ndx][1] + x;
							object.subject.attrs.path[ndx][2] = object.subject.attrs.path[ndx][2] + y;
						}
					} else {
						if (object.attrs.path[ndx][0].toLowerCase() != "z") {
							object.attrs.path[ndx][1] = object.attrs.path[ndx][1] + x;
							object.attrs.path[ndx][2] = object.attrs.path[ndx][2] + y;
						}
					}
				}
			}
			break;
		}

		//	we've changed the path, lets rebuild it.
		if (pl > 0) {
			if (useSubject) {
				object.subject.message.path = object.subject.attrs.path.toString();
			} else {
				object.message.path = object.attrs.path.toString();
			}
		}
	}

	return updated;
}

//----------------------------------------------------------------------------
//	object.subject.message
//	object.subject.attrs.path.toString()	get path from the path array
//	object.subject.attrs.path.length (pl)

//	object.subject.attrs.path[0..(pl - 1)]	//	[command, x, y]	where command is "M" (move) | "L" (line)
//
//	object.attrs.translate					//	{x: float, y: float}	//	how much to translate
//	object.attrs.rotate						//	how much to rotate (in degrees)
//	object.attrs.translate					//	{x: float, y: float}	//	how much to scale

function callbackFT(object, events) {
	if (events.length === 0) return;

	//	is our object up to grade?
	if (isEmpty(object)) return;
	if (isEmpty(object.attrs)) return;
	if (isEmpty(object.subject)) return;
	if (isEmpty(object.subject.message)) return;

	//	these are used to record the last translation.  It seems free transform accumulates
	if (isEmpty(object.subject.message.transX)) object.subject.message.transX = 0;
	if (isEmpty(object.subject.message.transY)) object.subject.message.transY = 0;

	var doSave = false;


	//	OK, lets process our event
	switch (events[0]) {
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		case "init": {
		}
		break;

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		case "drag start": {
			switch(window.whiteboardMode) {
				case WHITEBOARD_MODE_DELETE: {
					var newObject = null;
					newObject = jQuery.extend(true, {}, object);	//	this clones the object

					//	update our undo manager
					um.push({
						action: 'delete',
						uid: object.subject.message.id,
						object: newObject
					});

					socket.emit('deleteobject', object.subject.message.id);

					//object.unplug();			//	lets remove the free translation stuff first
					object.hideHandles();
					object.subject.hide();		//	we can unhide this object if this action is "undo"ne
				}
				break;
				default: {
					switch(object.subject.type) {
						default: {
							object.attrs.transX = object.attrs.translate.x;
							object.attrs.transY = object.attrs.translate.y;
						}
						break;
					}
				}
				break;
			}
		}
		break;

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		case "drag": {
			//console.log("drag      : " + object.attrs.translate.x + ", " + object.attrs.translate.y);
		}
		break;

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		case "drag end": {
			//console.log("drag end  : " + object.attrs.translate.x + ", " + object.attrs.translate.y);

			//	did we just move this?
			if (!isEmpty(object.attrs.translate)) {
				var x = (object.attrs.translate.x - object.attrs.transX),
					y = (object.attrs.translate.y - object.attrs.transY);

				//console.log("x, y      : " + x + ", " + y);

				//	we need to reset these...
				//object.attrs.transX = object.attrs.translate.x;
				//object.attrs.transY = object.attrs.translate.y;

				um.push({
					action: 'move',
					translate: {
						x: x,
						y: y
					},
					uid: object.subject.message.id,
					object: object
				});

				doSave = updatePathForObject(object, x, y);
			}
		}
		break;

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		case "rotate start": {
			//console.log(":rotate start");

			rotate = object.attrs.rotate;			//	0...180, 0...-181.999
			if (rotate < 0) rotate = 360 + rotate;	//	0..359.999
		}
		break;

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		case "rotate end": {
			var newRotate = object.attrs.rotate;			//	0...180, 0...-181.999
			if (newRotate < 0) newRotate = 360 + newRotate;	//	0..359.999
			var actualRotation = (rotate - newRotate);

			um.push({
				action: 'rotate',
				rotate: actualRotation,
				uid: object.subject.message.id,
				object: object
			});

			object.subject.message.rotate = object.attrs.rotate;
			doSave = true;
		}
		break;

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		case "scale start": {
			//console.log(":scale start");
			scale = {
				x: object.attrs.scale.x,
				y: object.attrs.scale.y
			};
		}
		break;

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		case "scale end": {
			var newScale = object.attrs.scale;
			var actualScale = {
				x: newScale.x - scale.x,
				y: newScale.y - scale.y
			};

			um.push({
				action: 'scale',
				scale: actualScale,
				uid: object.subject.message.id,
				object: object
			});

			object.subject.message.scale = object.attrs.scale;
			doSave = true;
		}
		break;

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		default: {

		}
		break;
	}

	if (doSave) {
		var messageJSON = {
			type: 'sendobject',
			message: object.subject.message
		}

		window.sendMessage(messageJSON);
	}
};

//----------------------------------------------------------------------------
/*
	json = {
		default: float,			//	default distance
		sizes: array[{
			size: float,		//	if < size
			distance: float		//	return this distance
		}]
	}
*/
function getDistance(object, json) {
	//	we will asume json is set up correctly (for now)
	var size = (object.getBBox().width > object.getBBox().height) ? object.getBBox().height : object.getBBox().width;

	for (var ndx = 0, ls = json.sizes.length; ndx < ls; ndx++) {
		if (size < json.sizes[ndx].size) return json.sizes[ndx].distance;
	}

	return json.default;
}

//----------------------------------------------------------------------------
function doIHaveAccess(role, username) {
	var result = false;

	if (role === 'always') return true;

	if (!isEmpty(role)){
		switch(role) {
			case 'co-facilitator':
			case 'facilitator': {
				result = true;
			}
			break;
			default: {
				if (!isEmpty(window.username)) {
					result = (username === window.username);
				}
			}
			break;
		}
	}

	return result;
};

function getObjectRadius(object) {
	var result = 20;
	var bbox = object.getBBox();
	if (!isEmpty(bbox)) {
		result = (bbox.width > bbox.height) ? bbox.width : bbox.height;
		result = result * 0.51;	//	radius should be 2/3rds

		//	is the handle too big?
		switch(object.type) {
			case "text":
			case "text-box": {
				if (result < 20) result = 20;
			}
			break;
			default: {
				result = 20;
			}
			break;
		}
	}

	return result;	//	return the default
}

function getFTSetup() {
	var fill = '#7f7f7f',
		distance = 1,
		scale = false,
		rotate = false,
		size = 10,		//	default
		drag = true,
		draw = [];

	switch(window.whiteboardMode) {
		case WHITEBOARD_MODE_MOVE:
		break;
		case WHITEBOARD_MODE_SCALE:
			//scale = ['bboxCorners'];
			scale = ['axisX', 'axisY'];
			centre = 0;
			draw = ['bbox'];
			drag = false;
		break;
		case WHITEBOARD_MODE_ROTATE:
			rotate = true;
			centre = 0;
			draw = ['circle'];
			drag = false;
			//distance = 0;
		break;
		case WHITEBOARD_MODE_DELETE:
			fill = 'red';
		break;
	}

	var ftSetup = {
		drag: drag,
		scale: scale,
		rotate: rotate,
		opacity: 0.5,
		snap: {
			rotate: 5
		},
		attrs: {
			stroke: '#000000',
			fill: fill,
			opacity: 0.5
		},
		draw: draw,
		boundary: {
			x: 0,
			y: 0,
			width: 950,
			height: 460
		},
		distance: distance,
		size: size
	};

	return ftSetup;
}

//----------------------------------------------------------------------------
//	create a free transform object for our raphael object
function attachFreeTransformToObject(role, paper, object, scale, rotate) {
	//	are our arguments valid?
	if (isEmpty(role)) return;
	if (isEmpty(paper)) return;
	if (isEmpty(object)) return;
	if (isEmpty(object.type)) return;

	if (isEmpty(scale)) scale = {x: 1, y: 1};
	if (isEmpty(rotate)) rotate = 0;

	//	there is an interesting test now, we check to see if the whiteboard
	//	is expanded or not, if not, then don't attach the freeTransform just now...

	//if (paper.width != paper.w) return;	//	the whiteboard isn't expanded

	var ftSetup = getFTSetup();
	ftSetup.type = object.type;

	//	no need to check the role here, all object get a free transform object applied to it...
	if (!isEmpty(object.message)) {
		ftSetup.size = getObjectRadius(object);
		var ftObject = paper.freeTransform(object, ftSetup, callbackFT);
		ftObject.attrs.rotate = rotate;
		ftObject.attrs.scale = scale;
		ftObject.apply();

		switch(window.whiteboardMode) {
			case WHITEBOARD_MODE_MOVE:
			case WHITEBOARD_MODE_DELETE:
			break;
			default:
				ftObject.hideHandles();
			break;
		}
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//	I've created this routine for completeness, but really, we should
//	never need to call this.  Objects will have a free transform object
//	attached to them when they are created.
function attachFreeTransformToObjects(role, paper) {
	//	are our arguments valid?
	if (isEmpty(role)) return;
	if (isEmpty(paper)) return;

	paper.forEach(function(object) {
		if (!isEmpty(object.message)) {
			attachFreeTransformToObject(role, paper, object);
		}
	});
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function showFreeTransformToObjects(role, paper, whiteboardMode) {
	//	are our arguments valid?
	if (isEmpty(role)) return;
	if (isEmpty(paper)) return;
	if (isEmpty(whiteboardMode)) whiteboardMode = WHITEBOARD_MODE_MOVE;

	window.whiteboardMode = whiteboardMode;				//	lets set our "global" whiteboard mode

	paper.forEach(function(object) {
		if (!isEmpty(object.parent)) object = object.parent;
		if (!isEmpty(object.message)) {
			if (doIHaveAccess(role, object.message.name)) {
				if (!isEmpty(object.freeTransform)) {
					if (!isEmpty(object.freeTransform.subject)) {
						var isVisible = true;	//	default
						if (object.type === "set") {
							if (object.freeTransform.subject.length > 0) {
								isVisible = object.freeTransform.subject[0].is_visible();
							}
						} else {
							isVisible = object.freeTransform.subject.is_visible();
						}

						if (isVisible) {
							var ftSetup = getFTSetup();
							object.freeTransform.setOpts(ftSetup, callbackFT);
							object.freeTransform.showHandles(whiteboardMode);
						}
					}
				} else {
					//	this object should have a free transform attached to it
					attachFreeTransformToObject(role, paper, object);
					object.freeTransform.showHandles(whiteboardMode);
				}
			}
		}
	});
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function hideFreeTransformToObjects(paper) {
	//	are our arguments valid?
	if (isEmpty(paper)) return;

	window.whiteboardMode = WHITEBOARD_MODE_NONE;		//	lets reset our "global" whiteoard mode

	paper.forEach(function(object) {
		if (!isEmpty(object.parent)) object = object.parent;
		if (!isEmpty(object.message)) {
			if (!isEmpty(object.freeTransform)) {
				object.freeTransform.hideHandles();
			}
		}
	});
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function removeFreeTransformObjects(paper) {
	//	are our arguments valid?
	if (isEmpty(paper)) return;

	window.whiteboardMode = WHITEBOARD_MODE_NONE;		//	lets reset our "global" whiteoard mode

	deleteStack = [];

	paper.forEach(function(object) {
		if (!isEmpty(object.parent)) object = object.parent;
		if (!isEmpty(object.message)) {
			if (!isEmpty(object.freeTransform)) {
				deleteStack.push(object);
			}
		}
	});

	while (deleteStack.length > 0) {
		var object = deleteStack.pop();

		object.freeTransform.unplug();			//	lets remove the free translation stuff first
		object.remove();

		//	now lets remove this object (keep our memory clean)
		delete object;
	}
};

//----------------------------------------------------------------------------
function findObjectByID(paper, id) {
	//	are our arguments valid?
	if (isEmpty(paper)) return null;

	var result = null;

	paper.forEach(function(object) {
		if (!isEmpty(object.parent)) object = object.parent;
		if (!isEmpty(object.message)) {
			if (!isEmpty(object.message.id)) {
				if (object.message.id === id) {
					result = object;
				}
			}
		}
	});

	return result;
}
