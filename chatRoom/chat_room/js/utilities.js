//-----------------------------------------------------------------------------
var DEFAULT_SPEED = 0,
    DEFAULT_ICON_RADIUS = 8,
    DEFAULT_BUBBLE_CHARACTERS_PER_LINE = 20,
    DEFAULT_BUBBLE_ROWS = 4,
    DEFAULT_COMMENT_LENGTH = 300,
    LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.";


//	make sure console.log works in IE
(function () {
    if (!window.console) {
        window.console = {};
    }

    // union of Chrome, FF, IE, and Safari console methods
    var m = [
        "log", "info", "warn", "error", "debug", "trace", "dir", "group",
        "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
        "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
    ];

    // define undefined methods as noops to prevent errors
    for (var i = 0; i < m.length; i++) {
        if (!window.console[m[i]]) {
            window.console[m[i]] = function () {
            };
        }
    }
})();

//-----------------------------------------------------------------------------
function getOS() {
    var result = "unknown";

    if (navigator.appVersion.indexOf("Linux") != -1)    result = "linux";
    if (navigator.appVersion.indexOf("Mac") != -1)        result = "mac";
    if (navigator.appVersion.indexOf("Win") != -1)        result = "win";
    if (navigator.appVersion.indexOf("X11") != -1)        result = "unix";

    return result;
}

function processYouTubeData(youtubeData) {
    var preFix = '<iframe width="420" height="315" src="http://www.youtube.com/embed/';
    var subFix = '" frameborder="0" allowfullscreen></iframe>';

    var position = -1;

    if (youtubeData.search("<iframe") != -1) {
        return youtubeData;
    } else if (youtubeData.search("youtube.com/watch?") != -1) {
        position = youtubeData.search("v=") + 2;
        return preFix + youtubeData.substr(position) + subFix;
    } else if (youtubeData.search("youtu.be/") != -1) {
        position = youtubeData.search("youtu.be/") + 9;
        return preFix + youtubeData.substr(position) + subFix;
    }
    return null;
}

function processVoteResult(result) {
    var resultAsJson = JSON.parse(result);
    if (resultAsJson.length < 1) {
        var dashboard = window.getDashboard();
        dashboard.showMessage({
            message: {
                text: "No one has voted yet",
                attr: {
                    'font-size': 36,
                    fill: "white"
                }
            },
            dismiss: {
                yes: {						//	check using window.dashboard.YES
                    text: "OK",
                    attr: {
                        'font-size': 24,
                        fill: "white"
                    }
                }
            }
        }, function (value) {
            dashboard.toBack();		//	time to hide the dashboard
        });

        return null;
    }

    var contentAsJson = null;

    try {
        var event = resultAsJson[0].event;
        var eventAsJson = JSON.parse(decodeURI(event));
        contentAsJson = JSON.parse(decodeURI(eventAsJson.content));
    }
    catch(ex) {
        var eventData = decodeURI(resultAsJson[0].event);
        contentAsJson = JSON.parse(eventData);
    }

    switch (contentAsJson.style) {
        case "YesNo":
            //return processYesNo(resultAsJson);
            return null;
        case "YesNoUnsure":
            return processYesNoUnsure(resultAsJson);
        case "FreeText":
            //return processFreeText(resultAsJson);
            return null;
        case "StarRating":
            return processStarRating(resultAsJson);
    }
    return null;
}

function processFreeText(resultAsJson) {
    var eventData = null,
        eventAsJson = null;

    var voteStatus = [];

    for (var ndx = 0; ndx < resultAsJson.length; ndx++) {
        eventData = decodeURI(resultAsJson[ndx].event);
        eventAsJson = JSON.parse(eventData);

        voteStatus[ndx] = [resultAsJson[ndx].name, eventAsJson.answer];
    }

    var resultJson = {
        style: "FreeText",
        voteStatus: voteStatus
    }
    return resultJson;
}

function processStarRating(resultAsJson) {
    var eventData = null,
        eventAsJson = null;

    var voteStatus = [],
        count = 0;

    for (var ndx = 0; ndx < resultAsJson.length; ndx++) {
        eventData = decodeURI(resultAsJson[ndx].event);
        eventAsJson = JSON.parse(eventData);

        if (eventAsJson.answer != "<No Answer>") {
            voteStatus[count] = [resultAsJson[ndx].name, eventAsJson.answer];
            count++;
        }
    }

    var resultJson = {
        style: "StarRating",
        voteStatus: voteStatus
    }
    return resultJson;
}

function processYesNo(resultAsJson) {
    var eventData = null,
        eventAsJson = null;

    var voteStatus = [];
    voteStatus[0] = 0;
    voteStatus[1] = 0;

    for (var ndx = 0; ndx < resultAsJson.length; ndx++) {
        eventData = decodeURI(resultAsJson[ndx].event);
        eventAsJson = JSON.parse(eventData);

        switch (eventAsJson.answer) {
            case "Yes":
                voteStatus[0]++;
                break;
            case "No":
                voteStatus[1]++;
                break;
        }
    }

    var resultJson = {
        style: "YesNo",
        voteStatus: voteStatus
    }
    return resultJson;
}

function processYesNoUnsure(resultAsJson) {
    var eventData = null,
        eventAsJson = null;

    var voteStatus = [],
        count = 0;

    for (var ndx = 0; ndx < resultAsJson.length; ndx++) {
        eventData = decodeURI(resultAsJson[ndx].event);
        eventAsJson = JSON.parse(eventData);

        if (eventAsJson.answer != "<No Answer>") {
            voteStatus[count] = [resultAsJson[ndx].name, eventAsJson.answer];
            count++;
        }
    }

    var resultJson = {
        style: "YesNoUnsure",
        voteStatus: voteStatus
    }
    return resultJson;
}

function getBrowser() {
    function testCSS(prop) {
        return prop in document.documentElement.style;
    }

    var result = "unknown";

    var isOpera = !!(window.opera && window.opera.version);  										// Opera 8.0+
    var isFirefox = testCSS('MozBoxSizing');                 										// FF 0.8+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;	// At least Safari 3+: "[object HTMLElementConstructor]"
    var isChrome = !isSafari && testCSS('WebkitTransform');  										// Chrome 1+
    var isIE = /*@cc_on!@*/false || testCSS('msTransform');  										// At least IE6

    if (isOpera) result = "opera";
    if (isFirefox) result = "firefox";
    if (isSafari) result = "safari";
    if (isChrome) result = "chrome";
    if (isIE) result = "ie";

    return result;
}

//-----------------------------------------------------------------------------
//	this is an interesting quirk, in the dashboard, the y position of the text
//	is out by a factor or 2, I've done something strange in there, but no idea what...
function yy(y, browser) {
    if (browser === "firefox") {
        y = y * 2;
    }

    return y;
}

//-----------------------------------------------------------------------------
// Raphael.el.valignFix = function() {
// 	var valign = (this.paper.raphael.svg) ? 0 : 3;

// 	return this.translate(0, valign);
// };

//-----------------------------------------------------------------------------
function namespace(namespaceString) {
    var parts = namespaceString.split('.'),
        parent = window,
        currentPart = '';

    for (var i = 0, length = parts.length; i < length; i++) {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] || {};
        parent = parent[currentPart];
    }

    return parent;
};

//-----------------------------------------------------------------------------
function isEmpty(value) {
    if (typeof value == "undefined") return true;					//	undefined object?
    if (value === null) return true;								//	null object?
    if (value === '') return true;									//	is it an empty string?
    if (typeof value == "number" && isNaN(value)) return true;		//	valid Number?
    if (value instanceof Date && isNaN(Number(value))) return true;	//	valid Date?

    return false;
}

//-----------------------------------------------------------------------------
function extend(from, to) {
    if (from == null || typeof from != "object") return from;
    if (from.constructor != Object && from.constructor != Array) return from;
    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
        from.constructor == String || from.constructor == Number || from.constructor == Boolean)
        return new from.constructor(from);

    to = to || new from.constructor();

    for (var name in from) {
        to[name] = typeof to[name] == "undefined" ? extend(from[name], null) : to[name];
    }

    return to;
};

//-----------------------------------------------------------------------------
//	for now this routine only tests for iPad, but we'll check for other devices as time goes on...
function isTouch() {
    var userAgent = navigator.userAgent;
    //console.log("isTouch() : " + navigator.userAgent);

    result = (userAgent.match(/iPad/i) != null);

    return result;
}

//-----------------------------------------------------------------------------
function getBrowserDimensions() {
    var lWidth = 0;
    var lHeight = 0;
    if (self.innerHeight) {
        lWidth = self.innerWidth;
        lHeight = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
        lWidth = document.documentElement.clientWidth;
        lHeight = document.documentElement.clientHeight;
    }
    else if (document.body) {
        lWidth = document.body.clientWidth;
        lHeight = document.body.clientHeight;
    }

    return {
        width: lWidth,
        height: lHeight
    };
};

//-----------------------------------------------------------------------------
//	date comes in with the format (yyyy-mm-dd HH:MM:ss)
//	we want to change this to new Date()
function stringToDate(dateAsString) {
    if (!isEmpty(dateAsString)) {
        var dateTimeAsArray = dateAsString.split(" ");
        var dateAsArray = dateTimeAsArray[0].split("-");
        var timeAsArray = dateTimeAsArray[1].split(":");

        return new Date(Number(dateAsArray[0]), Number(dateAsArray[1]) - 1, Number(dateAsArray[2]), Number(timeAsArray[0]), Number(timeAsArray[1]), Number(timeAsArray[2]));
    }

    return null;
}

function is_int(value) {
    return ((typeof(value) === 'number') && (parseInt(value) === value));
}

//-----------------------------------------------------------------------------
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.ltrim = function () {
    return this.replace(/^\s+/, "");
};

String.prototype.rtrim = function () {
    return this.replace(/\s+$/, "");
};

String.prototype.toUpperCaseFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.toLowerCaseFirstLetter = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

String.prototype.capitalize = function () {
    return this.replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
    });
};

String.prototype.toCamelCase = function () {
    return this.capitalize().split(" ").join("").toLowerCaseFirstLetter();
}

//-----------------------------------------------------------------------------
//	these functions move the cursor in a textfield to a particular position
//	http://blog.vishalon.net/index.php/javascript-getting-and-setting-caret-position-in-textarea/
function doGetCaretPosition(ctrl) {
    var CaretPos = 0;	// IE Support
    if (document.selection) {
        ctrl.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -ctrl.value.length);
        CaretPos = Sel.text.length;
    }
    // Firefox support
    else if (ctrl.selectionStart || ctrl.selectionStart == '0')
        CaretPos = ctrl.selectionStart;
    return (CaretPos);
}

function resetCaretPosition(ctrl) {
    if (ctrl.setSelectionRange) {
        ctrl.focus();

        ctrl.setSelectionRange(0, 0);
    } else if (ctrl.createTextRange) {
        var range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', 0);
        range.moveStart('character', 0);

        range.select();
    }
}

//-----------------------------------------------------------------------------
//	{
//		lowest: value,
//		highest: value  		
//	}
//	ie.
//	var num = getRandomByte({lowest: 16, highest: 240});
//	returns a random number between 16 and 240 (inclusive)
function getRandomByte(range) {
    if (typeof(range) === 'undefined')    return Math.floor(Math.random() * 256);

    var lowest = 0, highest = 256;
    if (typeof(range.lowest) != 'undefined') lowest = range.lowest;
    if (typeof(range.highest) != 'undefined') highest = range.highest;

    return (Math.floor(Math.random() * (highest - lowest))) + lowest;
}

function getRandomColour() {
    var result = 0, index = 1, colourByte = 0;
    for (var ndx = 0; ndx < 3; ndx++) {
        colourByte = getRandomByte({lowest: 32, highest: 224});
        result = result + (colourByte * index);
        index = (index * 256);
    }

    return result;
};

function colourToHex(colour) {
    //	colour being passed could be a string
    colour = parseInt(colour);

    //if (isEmpty(colour)) return "#000";

    var hexColour = colour.toString(16);

    //	make sure our colour is padded
    while (hexColour.length < 6) hexColour = '0' + hexColour;

    return '#' + hexColour;
}

function hexToColour(hexColour) {
    //	remove '#' if included
    if (hexColour.charAt(0) == '#') hexColour = hexColour.substr(1);
    return parseInt(hexColour, 16);
}

function colourToRGB(colour) {
    var red = Math.floor(colour / 65536);
    var green = Math.floor((colour - (red * 65536)) / 256);
    var blue = colour - (red * 65536) - (green * 256);

    return {
        red: red,
        green: green,
        blue: blue
    }
}

function RGBToColour(RGBColour) {
    return (RGBColour.red * 65536) + (RGBColour.green * 256) + RGBColour.blue;
}

//	this function allows for adding to a colour, i.e.
//		var newColour = addToColour(myColour, parseInt('101010', 16));
function addToColour(colour, add) {
    var colourAsRGB = colourToRGB(colour);
    var addAsRGB = colourToRGB(add);
    var red = ((colourAsRGB.red + addAsRGB.red) > 255) ? 255 : (colourAsRGB.red + addAsRGB.red);
    var green = ((colourAsRGB.green + addAsRGB.green) > 255) ? 255 : (colourAsRGB.green + addAsRGB.green);
    var blue = ((colourAsRGB.blue + addAsRGB.blue) > 255) ? 255 : (colourAsRGB.blue + addAsRGB.blue);

    return {
        red: red,
        green: green,
        blue: blue
    }
}

//	this function allows for adding to a colour, i.e.
//		var newColour = addToColour(myColour, parseInt('101010', 16));
function takeFromColour(colour, take) {
    var colourAsRGB = colourToRGB(colour);
    var takeAsRGB = colourToRGB(take);
    var red = ((colourAsRGB.red - takeAsRGB.red) < 0) ? 0 : (colourAsRGB.red - takeAsRGB.red);
    var green = ((colourAsRGB.green - takeAsRGB.green) < 0) ? 0 : (colourAsRGB.green - takeAsRGB.green);
    var blue = ((colourAsRGB.blue - takeAsRGB.blue) < 0) ? 0 : (colourAsRGB.blue - takeAsRGB.blue);

    return {
        red: red,
        green: green,
        blue: blue
    }
}

function getInverseColour(colour) {
    var colourAsRGB = colourToRGB(colour);

    var red = ((colourAsRGB.red + 128) % 256);
    var green = ((colourAsRGB.green + 128) % 256);
    var blue = ((colourAsRGB.blue + 128) % 256);

    return {
        red: red,
        green: green,
        blue: blue
    }
}

function lightenColour(colour) {
    var add = parseInt('202020', 16);
    return RGBToColour(addToColour(colour, add));
}

function darkenColour(colour) {
    var take = parseInt('202020', 16);
    return RGBToColour(takeFromColour(colour, take));
}

function colourToGradientLighter(colour_one, angle) {
    var colour_two = lightenColour(colour_one);

    if (typeof(angle) === 'undefined') angle = '90';

    var result = angle + '-' + colourToHex(colour_one) + '-' + colourToHex(colour_two);

    return result;
}

function colourToGradientDarker(colour_one, angle) {
    var colour_two = darken(colour_one);

    if (typeof(angle) === 'undefined') angle = '270';

    var result = angle + '-' + colourToHex(colour_one) + '-' + colourToHex(colour_two);

    return result;
}

function colourToGradientLighterDarker(colour_one, angle) {
    var difference = parseInt('202020', 16);
    var colour_lighter = RGBToColour(addToColour(colour_one, difference));
    var colour_darker = RGBToColour(takeFromColour(colour_one, difference));

    if (typeof(angle) === 'undefined') angle = '90';

    var result = angle + '-' + colourToHex(colour_lighter) + '-' + colourToHex(colour_darker);

    return result;
}

function colourToGradientOffLine(colour_one, angle) {
    var add = parseInt('808080', 16);
    var colour_two = RGBToColour(addToColour(colour_one, add));

    if (typeof(angle) === 'undefined') angle = '90';

    var result = angle + '-' + colourToHex(colour_one) + '-' + colourToHex(colour_two);

    return result;
}

//-----------------------------------------------------------------------------
/*
 this routine takes a width and height and converts them to best fit the orginal dimensions.

 for example:
 getFittedDimensions(100, 100, 100, 56)			returns {56, 56}
 getFittedDimensions(100, 10, 100, 56)			returns {100, 10}
 getFittedDimensions(400, 200, 100, 56)			returns {100, 56}
 getFittedDimensions(400, 350, 100, 56)			returns {64, 56}
 */
function getFittedDimensions(width, height, orgWidth, orgHeight) {
    if ((width <= orgWidth) && (height <= orgHeight)) {
        return {width: width, height: height};
    }

    var ratioWidth = width / orgWidth,
        ratioHeight = height / orgHeight;

    if ((width > orgWidth) && (height > orgHeight)) {
        if (ratioWidth > ratioHeight) {
            return {width: orgWidth, height: Math.floor(height / ratioWidth)};
        } else {
            return {width: Math.floor(width / ratioHeight), height: orgHeight};
        }
    }

    if (width > orgWidth) {
        return {width: orgWidth, height: Math.floor(height / ratioWidth)};
    }

    return {width: Math.floor(width / ratioHeight), height: orgHeight};
}

//-----------------------------------------------------------------------------
function ellipsePath(x, y, rx, ry) {
    if (ry == null) {
        ry = rx;
    }
    return [
        ["M", x, y],
        ["m", 0, -ry],
        ["a", rx, ry, 0, 1, 1, 0, 2 * ry],
        ["a", rx, ry, 0, 1, 1, 0, -2 * ry],
        ["z"]
    ];
};

function getCircleToPath(x, y, r) {
    //var result = "M" + x + "," + (y - r) + "A" + r + "," + r + ",0,1,1," + (x - 0.1) + "," + (y - r) + "Z";
    //var result = "M0,24A-24,-24,0,1,1,-0.1,24Z";

    //return result;
    return ellipsePath(x, y, r);
};

function getEllipseToPath(x, y, rx, ry) {
    return ellipsePath(x, y, rx, ry);
};

function getRectToPath(x, y, w, h) {
    var result = "M";

    result = result + "" + x + "," + y;
    result = result + "L" + (x + w) + "," + y;
    result = result + "L" + (x + w) + "," + (y + h);
    result = result + "L" + x + "," + (y + h);
    result = result + "Z";

    return result;
};

function getRoundedRectToPath(x, y, w, h, r) {
    var result = "M" + x + "," + (y + r);
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + r) + "," + y;
    result = result + "L" + (x + w - r) + "," + y;
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + w) + "," + (y + r);
    result = result + "L" + (x + w) + "," + (y + h - r);
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + w - r) + "," + (y + h);
    result = result + "L" + (x + r) + "," + (y + h);
    result = result + "A" + r + "," + r + " 0 0,1 " + x + "," + (y + h - r);
    result = result + "Z";

    return result;
};


//
//  + <-- (x,y) __tw__         ___
//            /       \         .
//          /          \        h
//        /             \       .
//      /                \      .
//    /___________bw______\    _._
//    
//	x, y is the origin of this trapezoid
//  tw is the top width
//  bw is the bottom width
//  h is the height
function getRoundedTrapazoidToPath(paper, x, y, tw, bw, h, r) {
    var w = (bw > tw) ? bw : tw;

    var twx = x + ((w - tw) / 2), twy = y;
    var bwx = x + ((w - bw) / 2), bwy = (y + h);

    var leftSize = "M" + bwx + "," + bwy + "L" + twx + "," + twy;
    var rightSize = "M" + (bwx + bw) + "," + bwy + "L" + (twx + tw) + "," + twy;

    var leftSizePath = paper.path(leftSize);
    var rightSizePath = paper.path(rightSize);

    var lsbp = leftSizePath.getPointAtLength(r);
    var lstp = leftSizePath.getPointAtLength(leftSizePath.getTotalLength() - r);

    var rsbp = rightSizePath.getPointAtLength(r);
    var rstp = rightSizePath.getPointAtLength(rightSizePath.getTotalLength() - r);

    //	lets get rid of these
    leftSizePath.remove();
    rightSizePath.remove();

    var result = "M" + lstp.x + "," + lstp.y;
    result = result + "S" + twx + "," + twy + " " + (twx + r) + "," + twy;
    result = result + "L" + (twx + tw - r) + "," + twy;
    result = result + "S" + (twx + tw) + "," + twy + " " + rstp.x + "," + rstp.y;
    result = result + "L" + rsbp.x + "," + rsbp.y;
    result = result + "S" + (bwx + bw) + "," + bwy + " " + (bwx + bw - r) + "," + bwy;
    result = result + "L" + (bwx + r) + "," + bwy;
    result = result + "S" + bwx + "," + bwy + " " + lsbp.x + "," + lsbp.y;
    result = result + "Z";

    return result;
};

function getSectorToPath(x, y, r, startAngle, endAngle) {
    var rad = (Math.PI / 180);
    var x1 = x + r * Math.cos(-startAngle * rad),
        x2 = x + r * Math.cos(-endAngle * rad),
        y1 = y + r * Math.sin(-startAngle * rad),
        y2 = y + r * Math.sin(-endAngle * rad);

    var result = "M" + x + "," + y;
    result = result + "L" + x1 + "," + y1;
    result = result + "A" + r + "," + r + "," + 0 + "," + (endAngle - startAngle > 180) + "," + 0 + "," + x2 + "," + y2;
    return result;
}

function getBubbleRoundedCorner(x, y, r) {
    return "A" + r + "," + r + " 0 0,1 " + x + "," + y;
}

/*
 {
 x: int,
 y: int,
 width: int,
 height: int,
 radius: int,
 primaryLocation: string,	top | bottom | left | right
 secondaryLocation: string	top | bottom | left | right
 }
 examples...
 primaryLocation:	"top"			 _|\______
 secondaryLocation:	"left"			/
 |
 primaryLocation:	"left"			 _________
 secondaryLocation:	"top"		   _/
 \
 |
 */
function getSpeechBubblePath(speechJSON) {
    var x = speechJSON.x,
        y = speechJSON.y,
        w = speechJSON.width,
        h = speechJSON.height,
        r = speechJSON.radius,
        pl = speechJSON.primaryLocation,
        sl = speechJSON.secondaryLocation;

    var rr = r;		//	rr is used to draw the extender for the speech bubble
    if (r == 0) rr = 10;

    var result = "M" + x + "," + (y + r);	//	start with an absolute position

    //	top left corner
    result = result + getBubbleRoundedCorner(x + r, y, r);
    if (pl === "top") {
        switch (sl) {
            case 'left':
            {
                result = result + "L" + (x + r) + "," + (y - rr);
                result = result + "L" + (x + r + rr) + "," + y;
            }
                break;
            case 'middle':
            {
                result = result + "L" + (x + (w / 2) - rr) + "," + y;
                result = result + "L" + (x + (w / 2)) + "," + (y - rr);
                result = result + "L" + (x + (w / 2) + rr) + "," + y;
            }
                break;
            case 'right':
            {
                result = result + "L" + (x + w - r - rr) + "," + y;
                result = result + "L" + (x + w - r) + "," + (y - rr);
            }
                break;
        }
    }
    result = result + "L" + (x + w - r) + "," + y;

    //	top right corner
    result = result + getBubbleRoundedCorner(x + w, y + r, r);
    if (pl === "right") {
        switch (sl) {
            case 'top':
            {
                result = result + "L" + (x + w + rr) + "," + (y + r);
                result = result + "L" + (x + w) + "," + (y + r + rr);
            }
                break;
            case 'middle':
            {
                result = result + "L" + (x + w) + "," + (y + (h / 2) - rr);
                result = result + "L" + (x + w + rr) + "," + (y + (h / 2));
                result = result + "L" + (x + w) + "," + (y + (h / 2) + rr);
            }
                break;
            case 'bottom':
            {
                result = result + "L" + (x + w) + "," + (y + h - r - rr);
                result = result + "L" + (x + w + rr) + "," + (y + h - r);
            }
                break;
        }
    }
    result = result + "L" + (x + w) + "," + (y + h - r);

    //	bottom right corner
    result = result + getBubbleRoundedCorner(x + w - r, y + h, r);
    if (pl === "bottom") {
        switch (sl) {
            case 'right':
            {
                result = result + "L" + (x + w - r) + "," + (y + h + rr);
                result = result + "L" + (x + w - r - rr) + "," + (y + h);
            }
                break;
            case 'middle':
            {
                result = result + "L" + (x + (w / 2) - r) + "," + (y + h);
                result = result + "L" + (x + (w / 2)) + "," + (y + h + rr);
                result = result + "L" + (x + (w / 2) + r) + "," + (y + h);
            }
                break;
            case 'left':
            {
                result = result + "L" + (x + r + rr) + "," + (y + h);
                result = result + "L" + (x + r) + "," + (y + h + rr);
            }
                break;
        }
    }
    result = result + "L" + (x + r) + "," + (y + h);

    //	bottom left corner
    result = result + getBubbleRoundedCorner(x, y + h - r, r);
    if (pl === "left") {
        switch (sl) {
            case 'bottom':
            {
                result = result + "L" + (x - rr) + "," + (y + h - r);
                result = result + "L" + x + "," + (y + h - r - rr);
            }
                break;
            case 'middle':
            {
                result = result + "L" + x + "," + (y + (h / 2) + rr);
                result = result + "L" + (x - rr) + "," + (y + (h / 2));
                result = result + "L" + x + "," + (y + (h / 2) - rr);
            }
                break;
            case 'top':
            {
                result = result + "L" + x + "," + (y + r + rr);
                result = result + "L" + (x - rr) + "," + (y + r);
            }
                break;
        }
    }
    result = result + "z";

    return result;
}

function getSpeechBubbleLeftBottom(x, y, w, h, r) {
    var rr = r;		//	rr is used to draw the extender for the speech bubble
    if (r == 0) rr = 10;
    var result = "M" + x + "," + (y + r);
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + r) + "," + y;
    result = result + "L" + (x + w - r) + "," + y;
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + w) + "," + (y + r);
    result = result + "L" + (x + w) + "," + (y + h - r);
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + w - r) + "," + (y + h);
    result = result + "L" + (x + r + rr) + "," + (y + h);
    result = result + "L" + (x + r) + "," + (y + h + rr);
    result = result + "L" + (x + r) + "," + (y + h);
    result = result + "A" + r + "," + r + " 0 0,1 " + x + "," + (y + h - r);
    result = result + "Z";

    return result;
};

function getSpeechBubbleRightBottom(x, y, w, h, r) {
    var rr = r;		//	rr is used to draw the extender for the speech bubble
    if (r == 0) rr = 10;
    var result = "M" + x + "," + (y + r);
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + r) + "," + y;
    result = result + "L" + (x + w - r) + "," + y;
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + w) + "," + (y + r);
    result = result + "L" + (x + w) + "," + (y + h - r);
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + w - r) + "," + (y + h);
    result = result + "L" + (x + w - r) + "," + (y + h + rr);
    result = result + "L" + (x + w - r - rr) + "," + (y + h);
    result = result + "L" + (x + r) + "," + (y + h);
    result = result + "A" + r + "," + r + " 0 0,1 " + x + "," + (y + h - r);
    result = result + "Z";

    return result;
};

function getSpeechBubbleLeftLeft(x, y, w, h, r) {
    var rr = r;		//	rr is used to draw the extender for the speech bubble
    if (r == 0) rr = 10;
    var result = "M" + x + "," + (y + r);
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + r) + "," + y;
    result = result + "L" + (x + w - r) + "," + y;
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + w) + "," + (y + r);
    result = result + "L" + (x + w) + "," + (y + h - r);
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + w - r) + "," + (y + h);
    result = result + "L" + (x + r) + "," + (y + h);
    result = result + "A" + r + "," + r + " 0 0,1 " + x + "," + (y + h - r);
    result = result + "L" + x + "," + (y + r + rr);
    result = result + "L" + (x - rr) + "," + (y + r);
    result = result + "Z";

    return result;
};

function getSpeechBubbleRightRight(x, y, w, h, r) {
    var rr = r;		//	rr is used to draw the extender for the speech bubble
    if (r == 0) rr = 10;
    var result = "M" + x + "," + (y + r);
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + r) + "," + y;
    result = result + "L" + (x + w - r) + "," + y;
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + w) + "," + (y + r);
    result = result + "L" + (x + w + rr) + "," + (y + r);
    result = result + "L" + (x + w) + "," + (y + r + rr);
    result = result + "L" + (x + w) + "," + (y + h - r);
    result = result + "A" + r + "," + r + " 0 0,1 " + (x + w - r) + "," + (y + h);
    result = result + "L" + (x + r) + "," + (y + h);
    result = result + "A" + r + "," + r + " 0 0,1 " + x + "," + (y + h - r);
    result = result + "Z";

    return result;
};

//-----------------------------------------------------------------------------
function insertEmoticons(data) {
    var os = getOS();
    switch (os) {
        case "linux":
            data = data.replace(":-)", "&#x263A;");
            data = data.replace(":)", "&#x263A;");
            break;
        case "mac":
            //	OS X supports some nice emoticons
            data = data.replace(":-)", "&#x1f600;");
            data = data.replace(":)", "&#x1f600;");
            break;
        case "unix":
            data = data.replace(":-)", "&#x263A;");
            data = data.replace(":)", "&#x263A;");
            break;
        case "win":
            data = data.replace(":-)", "&#x263A;");
            data = data.replace(":)", "&#x263A;");
            break;
        default:
            data = data.replace(":-)", "&#x263A;");
            data = data.replace(":)", "&#x263A;");
            break;
    }

    return data;
}

//-----------------------------------------------------------------------------
function formatText(text, numberOfCharacters) {
    var result = {
        text: "",
        more: false
    }

    if (isEmpty(text)) return result;
    if (isEmpty(numberOfCharacters)) numberOfCharacters = DEFAULT_COMMENT_LENGTH;

    var words = text.split(" ");

    var currentLine = "";
    for (var ndx = 0, numberOfWords = words.length; ndx < numberOfWords; ndx++) {
        if (ndx === 0) {
            result.text = words[ndx];
            if (result.text.length > numberOfCharacters) {
                result.text = result.text.substring(0, numberOfCharacters);
                result.more = true;

                break;
            }
        } else {
            if ((result.text + " " + words[ndx]).length > numberOfCharacters) {
                result.more = true;

                break
            } else {
                result.text = result.text + " " + words[ndx];
            }
        }
    }

    result.text = insertEmoticons(result.text);

    return result;
}

//-----------------------------------------------------------------------------
function formatFilename(filenamePlusExtension, numberOfCharacters) {
    if (isEmpty(filenamePlusExtension)) return "";
    if (isEmpty(numberOfCharacters)) numberOfCharacters = 20;

    //	fistly, lets remove the extension
    //var re = /(?:\.([^.]+))?$/;
    //var filename = re.exec(filenamePlusExtension)[0];
    var ndx = filenamePlusExtension.lastIndexOf(".");
    var filename = filenamePlusExtension;

    if (ndx > -1) {
        filename = "";
        if (ndx > 0) {
            filename = filenamePlusExtension.substring(0, ndx);
        }
    }
    if (filename.length > 24) filename = filename.substring(0, numberOfCharacters) + "...";

    return filename;
}

//-----------------------------------------------------------------------------
function formatBubbleText(text, lines, charactersPerLine) {
    var result = {
        text: "",
        more: false
    }

    if (isEmpty(text)) return result;
    if (isEmpty(lines)) lines = DEFAULT_BUBBLE_ROWS;
    if (isEmpty(charactersPerLine)) charactersPerLine = DEFAULT_BUBBLE_CHARACTERS_PER_LINE;

    var words = text.split(" ");

    var currentLine = "";
    var numberOfLines = 0;
    for (var ndx = 0, numberOfWords = words.length; ndx < numberOfWords; ndx++) {
        if (ndx === 0) {
            currentLine = words[ndx];	//	we'll assume no words will be longer than DEFAULT_BUBBLE_CHARACTERS_PER_LINE
        } else {
            if ((currentLine + " " + words[ndx]).length > charactersPerLine) {
                if (result.text === "") {
                    result.text = currentLine;
                    numberOfLines = 1;
                } else {
                    result.text = result.text + '\n' + currentLine;
                    numberOfLines = numberOfLines + 1;
                    if (numberOfLines === lines) {
                        result.more = true;

                        currentLine = "";

                        break;
                    }
                }
                currentLine = words[ndx];
            } else {
                currentLine = currentLine + " " + words[ndx];
            }
        }
    }

    if (!isEmpty(currentLine)) {
        result.text = result.text + '\n' + currentLine;
    }

    return result;
}

//-----------------------------------------------------------------------------
/*
 embeddedData has the format similar to
 <iframe width="420" height="315" src="http://www.youtube.com/embed/jhdFe3evXpk" frameborder="0" allowfullscreen></iframe>

 this routine converts it to
 <iframe id="player" width="640" height="480" src="http://www.youtube.com/embed/jhdFe3evXpk" frameborder="0" allowfullscreen></iframe>
 */
function getIFrameFromYouTubeEmbeddedData(embeddedData) {
    var result = null;
    var elements = embeddedData.split(" ");

    for (var elNdx = 0, ne = elements.length; elNdx < ne; elNdx++) {
        var attr = elements[elNdx].split("=");
        if (!isEmpty(attr)) {
            if (attr[0] === "src") {
                result = '<iframe id="player" width="640" height="480" src=' + attr[1] + ' frameboarder="0" allowfullscreen</iframe>';
            }
        }
    }

    return result;
}

//-----------------------------------------------------------------------------
function encodePunctuation(data) {
    data = data.replace(/\'/g, "%27");

    data = insertEmoticons(data);

    return data;
}

function decodePunctuation(data) {
    data = data.replace(/%27/g, "'");

    return data;
}

//-----------------------------------------------------------------------------
//	this is used to find the <TR> tag in a table.
//	Basically, this is first called from a <DIV> inside a <TD> tag, the idea
//	is to find out what row the <DIV> is inside off.  The <TR> tag has the
//	rowIndex property. 
var getRowIndex = function (element) {
    var result = -1;	//	default to not found
    if (isEmpty(element)) return result;
    if (isEmpty(element.rowIndex)) {
        if (isEmpty(element.parentNode)) {
            result = -1;								//	didn't find it...
        } else {
            result = getRowIndex(element.parentNode);	//	we haven't found it yet...
        }
    } else {
        result = element.rowIndex;						//	finally found it
    }

    return result;
};


//-----------------------------------------------------------------------------
/*
 json = {
 paper: pointer,					//	where do we draw this?
 x: float,						//	position of the counter
 y: float,
 count: int,						//	{default: 0}			initial count
 opacity: float,					//	{default: 1.0}			initial opacity
 radius: float,					//	{default: 5.0}			radius of counter (rounded rect)
 colour: string 					//	{default: BORDER_COLOUR}	colour of the counter
 }
 */
var createCounter = function (json) {
    //	make sure our params are OK
    if (isEmpty(json)) return;
    if (isEmpty(json.paper)) return;
    if (isEmpty(json.x)) return;
    if (isEmpty(json.y)) return;

    //	set up any defaults
    if (isEmpty(json.count)) json.count = 0;				//	make sure we have something in count
    if (isEmpty(json.opacity)) json.opacity = 1.0;			//	make sure we have something in opacity
    if (isEmpty(json.radius)) json.radius = 5.0;			//	make sure we have something in radius
    if (isEmpty(json.colour)) json.colour = BORDER_COLOUR;	//	make sure we have something in radius

    var topicLabelCounterText = json.paper.text(json.x, json.y, json.count.toString()).attr({
        'font-size': 9,
        fill: "#ffffff",	//	white
        opacity: json.opacity
    });

    var topicLabelCounterBBox = topicLabelCounterText.getBBox();

    var topicLabelCounterBackground = json.paper.rect(topicLabelCounterBBox.x - 5, topicLabelCounterBBox.y - 5, topicLabelCounterBBox.width + 10, topicLabelCounterBBox.height + 10, json.radius).attr({
        fill: json.colour,
        opacity: json.opacity,
        stroke: "#ffffff",
        "stroke-width": 2.0
    });
    topicLabelCounterText.toFront();

    //	default to hide state
    if (json.count === 0) {
        topicLabelCounterBackground.hide();
        topicLabelCounterText.hide();
    }

    return {
        background: topicLabelCounterBackground,
        text: topicLabelCounterText
    }
};


