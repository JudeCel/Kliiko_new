var view = namespace('sf.ifs.View');

view.UndoManager = function() {
	this.stack = new Array();
	this.stackPointer = -1;		//	nothing in the stack yet...
};

/*
	lets push an action onto our stack
*/
view.UndoManager.prototype.push = function(object) {
	//	firstly, is there anything between the stackPointer and the end of the stack?
	var sl = this.stack.length;

	//	firstly, lets only do this if we have something in the stack
	if (sl > 0) {
		while ((this.stackPointer + 1) < this.stack.length) {	//	we need to re-evaluate the stack length each time
			this.stack.pop();
		}
	}

	this.stack.push(object);
	this.stackPointer = (this.stack.length - 1);

	//	update the whiteboards undo & redo buttons
	this.updateWhiteboardMenu();
};

/*
	lets unto the last action that was pushed onto this stack
*/
view.UndoManager.prototype.undo = function() {
	var sl = this.stack.length;

	if (sl === 0) return null;	//	no objects yet, so nothing to undo
	if (this.stackPointer < 0) return null;	//	no objects left to undo

	var result = this.stack[this.stackPointer--];

	//	update the whiteboards undo & redo buttons
	this.updateWhiteboardMenu();

	return result;
};

/*
	lets redo the action that was undone earlier
*/
view.UndoManager.prototype.redo = function() {
	var sl = this.stack.length;

	if (sl === 0) return null;	//	no objects yet, so nothing to redo
	if (sl === (this.stackPointer + 1)) return null;	//	we are at the top of the stack

	var result = this.stack[++this.stackPointer];

	//	update the whiteboards undo & redo buttons
	this.updateWhiteboardMenu();

	return result;
};

/*
	put the stack back to its initial state
*/
view.UndoManager.prototype.reset = function() {
	this.stackPointer = -1;

	while (this.stack.length > 0) this.stack.pop();

	//	update the whiteboards undo & redo buttons
	this.updateWhiteboardMenu();

	return result;
};

/*
	returns {
		isUndo: boolean,			//	if true, then an undo is possible
		isRedo: boolean				//	if true, then a redo is possible
	}
*/
view.UndoManager.prototype.getStatus = function() {
	var result = {
		isUndo: false,
		isRedo: false
	}

	var sl = this.stack.length;

	if (sl === 0) return result;	//	no objects yet, so nothing to undo or redo

	if (this.stackPointer > -1)	result.isUndo = true;
	if ((this.stackPointer + 1) < sl) result.isRedo = true;

	return result;
};

/*
	this is used mainly for an edge case where an external participant updates an item
	found in this stack.
	when this occurs, we should just remove that object from our stack, that way we avoid possible
	problems with corruption due to external influences
*/
view.UndoManager.prototype.removeAllUID = function(uid) {
	var sl = this.stack.length;

	if (sl === 0) return result;	//	no objects yet, so nothing to undo or redo

	for (var ndx = (sl - 1); ndx > -1; ndx--) {
		if (this.stack[ndx].uid === uid) {
			//	lets remove this element
			this.stack.splice(ndx, 1);
		}
	}

	sl = this.stack.length;
	if (this.stackPointer >= sl) {
		this.stackPointer = (sl - 1);
	}

	this.updateWhiteboardMenu();
}

/*
	this is a very odd bit of code that is tied directly to the whiteboard.
	usually you would never do this, but for the sake of time I'll do it this
	way for now.
	TODO:	unbind this from the whiteboard (maybe by posting an event)
*/
view.UndoManager.prototype.updateWhiteboardMenu = function() {
	var activeColour = '#408ad2',
		inactiveColour = '#9f928b';

	var status = this.getStatus();
	window.whiteboard.icons.Undo.attr({fill: (status.isUndo) ? activeColour : inactiveColour});
	window.whiteboard.icons.Redo.attr({fill: (status.isRedo) ? activeColour : inactiveColour});
}
