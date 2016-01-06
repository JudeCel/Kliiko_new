var mtypes = require('./../../helpers/mtypes');
var _ = require("lodash");
var joi = require("joi");
var fs = require('fs'),
    pdfkit = require('pdfkit'),
    dateFormat = require('dateformat');
 avatarData 	= require('./avatar-data');			//	this holds the data required to create an avatar...

dateFormat.masks.printed = "dddd, mmmm dS, yyyy, h:MM:ss TT";
dateFormat.masks.chat = "HH:MM:ss dd/mm/yyyy";

//	firstly, lets locate this in the right position on the page
var translateX = 50,
    translateY = 100;

module.exports = {
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /*
     json = {
     type: string,						"PDF" || "CSV" || "TXT"
     includeFacilitator: boolean,		include content from the facilitators?
     facilitatorList: array,				[{userId: n}, {userId: n}, ...]
     report: {
     title: string,					{default: "undefined"}
     saveAs: string,					{required}
     fsPath: string,					{required} filesytem path on the server
     urlPath: string					{required} URL path on the server
     },
     ifs: {
     sessionId: int,				{required} id of the current session
     session: string,				{required} name of the current session
     topicId: int					{required} id of the current topic
     topic: string					{required} name of the current topic
     },
     page: {
     pageNumber: int,				{default: 1}
     header: string,					{default: "undefined"}
     layout: string					{default: "portrait"}		"portrait" || "landscape"
     }
     }
     */
    init: function (json) {
        json = _.defaults(_.clone(json || {}), {
            includeFacilitator: false
        });

        json.report = _.defaults(_.clone(json.report || {}), {
            title: "Untitled"
        });

        json.page = _.defaults(_.clone(json.page || {}), {
            header: "Untitled",
            layout: mtypes.pageOrientation.portrait
        });

        var err = joi.validate(json, {
            type: joi.string().required(),
            facilitatorList: joi.required(),
            report: joi.object().required(),
            ifs: joi.object().required(),
            page: joi.object().required(),
            includeFacilitator: joi.boolean().optional()
        });

        if (err)
            throw err;

        err = joi.validate(json.report, {
            saveAs: joi.string().required(),
            fsPath: joi.string().required(),
            urlPath: joi.string().required(),
            title: joi.string().optional(),
            type: joi.string().required()
        });

        if (err)
            throw err;

        err = joi.validate(json.ifs, {
            sessionId: joi.number().required(),
            session: joi.string().required(),
            topicId: joi.number().optional(),
            topic: joi.string().optional()
        });

        if (err)
            throw err;

        //globals
        this.fsPath = json.report.fsPath;
        this.currentLineY = 100;	//where our actual report will start
        this.type = json.type;
        this.session = json.ifs.session;
        this.topic = json.ifs.topic;
        this.includeFacilitator = this.includeFacilitator;
        this.facilitatorList = json.facilitatorList;
        this.saveAs = json.report.fsPath + 'reports/' + json.report.saveAs + '.' + this.type.toLowerCase();
        this.linkTo = json.report.urlPath + 'reports/' + json.report.saveAs + '.' + this.type.toLowerCase();
        this.session = json.ifs.session;
        this.topic = json.ifs.topic;
        this.header = json.page.header;

        //new page barrier
        this.newPageY = 800;
        this.justAddedNewPage = false;
        this.isFirst = true;

        //whiteboard specific globals
        this.deleteList = [];
        this.whiteboardOffsetX = 0;
        this.whiteboardOffsetY = 0;

        //vote specific globals
        this.firstQuestion = true;
        this.lastQuestion = null;

        if (this.type === 'PDF') {
            this.report = new pdfkit({
                info: {
                    Title: json.report.title,
                    Author: ''
                },
                //	set up some defaults now
                size: 'A4',
                layout: json.page.layout
            });
            this.report.previousY = this.report.y;
            this.report.layout = json.page.layout;
            this.report.font(json.report.fsPath + 'fonts/Arial.ttf');
            switch (json.report.type) {
                case mtypes.reportType.whiteboard:
//                    var fparams = {
//                        pageNumberRequired: false,
//                        dateRequired: false,
//                        margins: {
//                            bottom: 5,
//                            left: 5,
//                            right: 5,
//                            top: 5
//                        }
//                    };
//                    this.formatCurrentPage(fparams);
                    break;
                default:
                    this.formatCurrentPage();
                    break;
            }

        } else {
            this.report = "";	//	CSV and TXT are string reports
        }
    },

//    getPDFStats: function () {
//        return this.statsPDF;
//    },

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //	list of id's of objects that have eventually been deleted.
    //	this list is used by addWhiteboardObject to determine if the current
    //	'object' should be displayed or not
    /*
     list = [
     int, ...
     ]
     */
    setDeleteList: function (list) {
        this.deleteList = list;
    },

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //	returns true if id in this.deleteList, otherwise returns false
    isIdInDeleteList: function (id) {
        if (isEmpty(this.deleteList)) return;

        var dll = this.deleteList.length;
        if (dll === 0) return;

        for (var ndx = 0; ndx < dll; ndx++) {
            if (this.deleteList[ndx] === id) return true;
        }

        return false;
    },

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //	returns true if the userId is a facilitator
    isUserFacilitator: function (userId) {
        var result = false;
        for (var ndxFacilitatorList = 0, lr = this.facilitatorList.length; ndxFacilitatorList < lr; ndxFacilitatorList++) {
            if (this.facilitatorList[ndxFacilitatorList].userId === userId) {
                result = true;

                break;	//	lets get out of here
            }
        }

        return result;
    },


    getLogoX: function () {
        switch (this.report.layout) {
            case mtypes.pageOrientation.landscape:
                return 650;
            default:
                return 419;
        }
    },

    getHeaderWidth: function () {
        switch (this.report.layout) {
            case mtypes.pageOrientation.landscape:
                return this.getPageWidth() - 100;
            default:
                return this.getPageWidth();
        }
    },

    getPageWidth: function () {
        switch (this.report.layout) {
            case mtypes.pageOrientation.landscape:
                return 948;
            default:
                return 575;
        }
    },

    getPageHeight: function () {
        switch (this.report.layout) {
            case mtypes.pageOrientation.landscape:
                return 460;
            default:
                return 800;
        }
    },

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /*
     json = {
     fsPath: string,					//	full filesystem path to our application
     createNewPage: boolean,			//	{defaults: true} create a new page
     includeLogo: boolean			//	{defaults: true} show the Insider Focus logo?
     }
     */

    formatCurrentPage: function (params) {
        this.report.fillColor('black');

        var reportY = this.report.y;

        var err = joi.validate(params, {
            pageNumberRequired: joi.boolean().optional(),
            dateRequired: joi.boolean().optional(),
            margins: joi.object().optional()
        });

        params = _.defaults(_.clone(params || {}), {
            pageNumberRequired: true,
            dateRequired: true,
            margins: {
                bottom: 5,
                left: 72,
                right: 72,
                top: 5
            }
        });

        if (err)
            throw err;

        /*-----------------------------------------+
         | [E]             [D]         +----------+|
         | [F]                         |    [C]   ||
         |                             +----------+|
         this.currentLineY ->|                                         |
         |                                         |
         |                                         |
         |                                         |
         |                                         |
         |                                         |
         |                                         |
         |                                         |
         |                                         |
         |                                         |
         |                                         |
         |                                         |
         | [G]                     Page [A] of [B] |
         +-----------------------------------------+

         [A]	pageNumber
         [B]	numberOfPages (deprecated)
         [C] Insider Focus logo (166px x 49px)
         [D] Header
         [E]	Session
         [F] Topic
         [G] Date (current date & time)*/

        this.report.page.margins = params.margins;

        //	[A] & [B]
        if (params.pageNumberRequired) {
            this.report.fontSize(9);
            this.report.opacity(0.5);
            this.report.text("Page " + this.report.pages.length, 10, 820, {
                width: this.getPageWidth(),
                align: 'right'
            });
        }

        //	[G]
        if (params.dateRequired) {
            this.report.fontSize(9);
            this.report.text(dateFormat(new Date(), "printed"), 10, 820);
            this.report.opacity(1.0); //	lets put the opacity back now
        }

        //	[C]
        if (this.report.pages.length == 1) {
            this.report.opacity(0.5);
            this.report.image(this.fsPath + 'images/logoReport.png', this.getLogoX(), 10);
            this.report.opacity(1.0);
        }

        //	[D]
        this.report.fontSize(12);
        this.report.text(this.report.info.Title, 10, 10, {
            width: this.getHeaderWidth(),
            align: 'center'
        });

        //	[E]
        this.report.fontSize(18);
        this.report.text(this.session + " : " + (this.topic ? this.topic : ""), 10, 40);

        //	[F]
        /*if (this.topic) {
            this.report.fontSize(16);
            this.report.text(this.topic, 132, 42);
        }*/

        this.report.y = this.currentLineY = reportY;
        this.report.page.margins = {
            bottom: 50,
            left: params.margins.left,
            right: params.margins.right,
            top: 100
        };
    },

    /*
     json = {
     report: pointer,			//	pdfkit's page
     path: string, 				//	RaphaelJS formatted path
     attribute: string, 			//	RaphaelJS formatted attribute
     type: string, 				//	"circle" || "circle-fill"
     parameters: array, 			//	circle		[0]: centerX,
     [1]: centerY,
     [2]: radius
     transform: {
     x: int,					//	amount to transform the object along the X axsis
     y: int					//	amount to transform the object along the Y axsis
     },
     offset: {
     x: int,
     y: int
     },
     isFirst: boolean,			//	{default: false} is this the first item to display?
     isLast: boolean				//	{default: false} is this the last item to display?
     */
    raphaelToPDFKit: function (json) {
        //	is our json valid?
        if (typeof json === 'undefined') return;

        //	set up defaults
        if (typeof json.type === 'undefined') json.type = null;
        if (typeof json.parameters === 'undefined') json.parameters = null;
        if (typeof json.transform === 'undefined') json.transform = {
            x: 0,
            y: 0
        };
        if (typeof json.offset === 'undefined') json.offset = {
            x: 0,
            y: 0
        };

        if (typeof json.isFirst === 'undefined') json.isFirst = false;
        if (typeof json.isLast === 'undefined') json.isLast = false;

        if (this.isFirst) {
            offsetX = json.offset.x;
            offsetY = json.offset.y;
            this.isFirst = false;
        } else {
            offsetX = json.transform.x;
            offsetY = json.transform.y;
        }

        var fillColour = null,
            strokeColour = null;

        //	check fill
        if (typeof json.attribute.fill != "undefined") {
            if (json.attribute.fill == 'none') {
                fillColour = null;
            } else {
                fillColour = json.attribute.fill;
            }
        } else {
            fillColour = null;
        }

        //	check stroke
        if (typeof json.attribute.stroke != "undefined") {
            if (json.attribute.stroke == 'none') {
                strokeColour = null;
            } else {
                strokeColour = json.attribute.stroke;
            }
        } else {
            strokeColour = null;
        }

        if (typeof json.attribute['stroke-width'] != "undefined") {
            json.report.lineWidth(json.attribute['stroke-width']);
        } else {
            json.report.lineWidth(1);
        }

        if (json.type) {
            switch (json.type) {
                case 'circle':
                case 'circle-fill':
                {
                    if (json.parameters) {
                        json.report.translate(offsetX, offsetY).circle(json.parameters[0], json.parameters[1], json.parameters[2]);

                        //	after performing a translate, it's always a good idea to reset the translations that don't need to be remembered
                        json.report.translate(-json.transform.x, -json.transform.y);
                    }
                }
                    break;
                default:
                    json.report.translate(offsetX, offsetY).path(json.path);

                    //	after performing a translate, it's always a good idea to reset the translations that don't need to be remembered
                    json.report.translate(-json.transform.x, -json.transform.y);
            }
        } else {
            json.report.translate(offsetX, offsetY).path(json.path);

            //	after performing a translate, it's always a good idea to reset the translations that don't need to be remembered
            json.report.translate(-json.transform.x, -json.transform.y);
        }

        if (fillColour && strokeColour) {
            json.report.fillAndStroke(fillColour, strokeColour);
        } else if (fillColour) {
            json.report.fill(fillColour);
        } else if (strokeColour) {
            json.report.stroke(strokeColour);
        }

        if (json.isLast) {
            //	do something if needed...
        }
    },

    raphaelToPDFKitWithScale: function (json) {
        console.log(":raphaelToPDFKitWithScale");

        //	is our json valid?
        var x = 0,
            y = 0,
            width = 0,
            height = 0;

        if (typeof json === 'undefined') return;

        //	set up defaults
        if (typeof json.type === 'undefined') json.type = null;
        if (typeof json.bbox === 'undefined') json.bbox = null;

        if (json.bbox != null) {
            width = json.bbox.width;
            height = json.bbox.height;
        }

        if (typeof json.parameters === 'undefined') {
            json.parameters = null;
        } else {
            if (json.parameters != null) {
                if (json.parameters.length > 1) {
                    x = json.parameters[0],
                        y = json.parameters[1];
                }
            }
        }

        var centreX = 0,
            centreY = 0;

        if (width > 0 && width > 0) {
            centreX = x + (width / 2),
                centreY = y + (height / 2);
        }

        if (typeof json.transform === 'undefined') json.transform = {
            x: 0,
            y: 0
        };

        if (typeof json.offset === 'undefined') json.offset = {
            x: 0,
            y: 0
        };

        if (typeof json.isFirst === 'undefined') json.isFirst = false;
        if (typeof json.isLast === 'undefined') json.isLast = false;

        var fillColour = null,
            strokeColour = null;

        //	check fill
        if (typeof json.attribute.fill != "undefined") {
            if (json.attribute.fill == 'none') {
                fillColour = null;
            } else {
                fillColour = json.attribute.fill;
            }
        } else {
            fillColour = null;
        }

        //	check stroke
        if (typeof json.attribute.stroke != "undefined") {
            if (json.attribute.stroke == 'none') {
                strokeColour = null;
            } else {
                strokeColour = json.attribute.stroke;
            }
        } else {
            strokeColour = null;
        }

        if (typeof json.attribute['stroke-width'] != "undefined") {
            json.report.lineWidth(json.attribute['stroke-width']);
        } else {
            json.report.lineWidth(1);
        }

        json.report.translate(translateX, translateY);

        //	now lets draw an object from the whiteboard
        json.report.x = x;
        json.report.y = y;
        json.report.rotate(json.rotate, {origin: [centreX, centreY]});
        json.report.scale(json.scale.x, json.scale.y, {origin: [centreX, centreY]});

        if (json.type) {
            switch (json.type) {
                case 'text':
                case 'text-box':
                {
                    json.report.fontSize(json.attribute['font-size']);
                    json.report.fill(fillColour);

                    json.report.text(json.parameters[2], { width: 951, align: 'left' });

                }
                    break;
                case 'circle':
                case 'circle-fill':
                {
                    if (json.parameters) {
                        json.report.circle(x, y, json.parameters[2]);
                    }
                }
                    break;

                case 'image':
                    //x + translateX, y + translateY
                    json.report.image(json.content, translateX, translateY);
                    break;
                default:
                {
                    json.report.path(json.path);
                }
                    break;
            }
        } else {
            json.report.path(json.path);
        }

        if (fillColour && strokeColour) {
            json.report.fillAndStroke(fillColour, strokeColour);
        } else if (fillColour) {
            json.report.fill(fillColour);
        } else if (strokeColour) {
            json.report.stroke(strokeColour);
        }

        if (json.isLast) {
            //	do something if needed...
        }

        //json.report.transform((1 / json.scale.x), 0, 0, (1 / json.scale.y), centreX, centreY);
        json.report.scale((1 / json.scale.x), (1 / json.scale.y), {origin: [centreX, centreY]});
        json.report.rotate(-json.rotate, {origin: [centreX, centreY]});

        json.report.translate(-translateX, -translateY);

        json.report.restore();
    },

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /*
     json = {
     object: string,						//	{required}		"head" | "accessory" | "face" | "hair" | "top"
     index: int,							//	{default: 0}	0        0..11         0..7     0..11    0..11
     view: {								//	{required}
     x: int,							//	area to draw within
     y: int,
     width: int,						//	{default: 32}
     height: int						//	{default: 32}
     }
     }
     */
    avatarDataDraw: function (json) {
        if (typeof json === "undefined") return;
        if (typeof json.object === "undefined") return;
        if (typeof json.view === "undefined") return;
        if (typeof json.view.x === "undefined") return;
        if (typeof json.view.y === "undefined") return;

        //	set up defaults
        if (typeof json.index === "undefined") json.index = 0;
        if (typeof json.view.width === "undefined") json.view.width = 32;
        if (typeof json.view.height === "undefined") json.view.height = 32;

        var data = getAvatarData(json.object);
        if (data != {}) {
            if (typeof data.data != "undefined") {
                if (typeof data.data.paths != "undefined") {
                    if (typeof data.data.attributes != "undefined") {
                        var pl = data.data.paths.length,
                            al = data.data.attributes.length;

                        if (pl === al) {
                            //	OK, if we got here, we should be ready to draw this element
                            var pathsForObject = data.data.paths[json.index],
                                attributesForObject = data.data.attributes[json.index];

                            var pfol = pathsForObject.length,
                                afol = attributesForObject.length;

                            //	time to loop through the paths and attributes to draw this object
                            if (pfol === afol) {
                                this.report.scale(0.5);
                                this.report.translate(json.view.x, json.view.y);

                                //	lets draw the objects that make up the emotion
                                for (var ndx = 0; ndx < pfol; ndx++) {
                                    this.raphaelToPDFKit({
                                        report: this.report,
                                        path: pathsForObject[ndx],
                                        attribute: attributesForObject[ndx]
                                    });
                                }

                                this.report.stroke();	//	lets draw this object

                                this.report.translate(-json.view.x, -json.view.y);
                                this.report.scale(2.0);

                                this.report.fillColor('black');
                                this.report.strokeColor('black');
                            }
                        }
                    }
                }
            }
        }
    },

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /*
     this routine takes a width and height and converts them to best fit the orginal dimensions.

     for example:
     getFittedDimensions(100, 100, 100, 56)			returns {56, 56}
     getFittedDimensions(100, 10, 100, 56)			returns {100, 10}
     getFittedDimensions(400, 200, 100, 56)			returns {100, 56}
     getFittedDimensions(400, 350, 100, 56)			returns {64, 56}
     */
    getFittedDimensions: function (width, height, orgWidth, orgHeight) {
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
    },

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /*
     value
     Dave said "Hello, how are you?"

     returns
     "Dave said ""Hello, how are you?"""
     */
    formatString: function (value) {
        return '"' + value.replace(/"/g, '""') + '"'
    },

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /*
     json = {
     id: int,							//	{required} facilitator / participant id
     name: string,						//	{required} facilitator / participant name
     isTagged: boolean,					//	{default: false} is there a star?
     isReply: boolean,					//	{default: false} is this comment a reply (indent it)
     comment: string,					//	{required} comment made in the chat history
     emotion: string, 					//	{default: "normal"} "angry" | "confused" | "happy" | "love it" | "normal" | "sad" | "surprised" | "sleep"
     date: object						//	{required} date object, when the chat was created,
     isLast: boolean						//	{default: false}, is this the last object?
     }
     */
    addChatHistoryCSV: function (json) {
        //	did we pass the correct information?
        if (typeof json === "undefined") return;
        if (typeof json.userId === "undefined") return;
        if (typeof json.name === "undefined") return;
        if (typeof json.comment === "undefined") return;
        if (typeof json.date === "undefined") return;

        //	set up defaults
        if (typeof json.isTagged === "undefined") json.isTagged = false;
        if (typeof json.isReply === "undefined") json.isReply = false;
        if (typeof json.emotion === "undefined") json.emotion = "normal";
        if (typeof json.isLast === "undefined") json.isLast = false;

        //	OK, fill this section with the required items
        if (this.isFirst) {
            this.report = "name, comment, date, is tagged, is reply, emotion\n";
            this.isFirst = false;
        }

        this.report = this.report +
            json.name + "," +
            this.formatString(json.comment) + "," +
            json.date + "," +
            (json.isTagged === true).toString() + "," +
            (json.isReply === true).toString() + "," +
            json.emotion + "\n";
    },

    addChatHistoryTXT: function (json) {
        //	did we pass the correct information?
        if (typeof json === "undefined") return;
        if (typeof json.userId === "undefined") return;
        if (typeof json.name === "undefined") return;
        if (typeof json.comment === "undefined") return;
        if (typeof json.date === "undefined") return;

        //	set up defaults
        if (typeof json.isTagged === "undefined") json.isTagged = false;
        if (typeof json.isReply === "undefined") json.isReply = false;
        if (typeof json.emotion === "undefined") json.emotion = "normal";
        if (typeof json.isLast === "undefined") json.isLast = false;

        //	OK, fill this section with the required items
        if (this.isFirst) {
            this.report = this.session + " / " + this.topic + "\n\n";
            this.isFirst = false;
        }

        this.report = this.report +
            json.comment + "\n\n";
    },

    getEmotionIndex: function (emotion) {
        switch (emotion) {
            case "angry":
                return 0;
            case "confused":
                return 1;
            case "happy":
                return 2;
            case "smiling"://inserted alex
                return 2;

            case "love it":
                return 3;
            case "love"://inserted alex
                return 3;

            case "normal":
                return 4;
            case "sad":
                return 5;
            case "upset"://inserted alex
                return 5;

            case "surprised":
                return 6;
            case "sleep":
                return 7;
            default:
                return 4;
        }
    },

    addChatHistoryPDF: function (json) {
        var err = joi.validate(json, {
            fsPath: joi.string().required(),
            userId: joi.number().required(),
            name: joi.string().required(),
            comment: joi.string().required(),
            date: joi.object().required(),
            isFirst: joi.boolean().optional(),
            isLast: joi.boolean().optional(),
            isReply: joi.boolean().optional(),
            isTagged: joi.boolean().optional(),
            emotion: joi.string().optional()
        });

        if (err)
            throw err;

        var isDescription = json.userId == 0;
        json.params = _.defaults(_.clone(json || {}), {
            isTagged: false,
            isReply: false,
            emotion: "normal",
            isLast: false
        });

        //we want to be sure "head", separator and first line has enough space (70px) to be displayed. if there is no space, create new page.
        if (this.newPageY - this.report.y < 70) {
            this.report.addPage();
            this.formatCurrentPage();
        }

        /*(!isReply)
         +-----------------------------------------+
         | _______________________________________ | <- separator [F]
         this.currentLineY ->| [   ][A]                            [E] |
         | [ B ][                                ] |
         | [   ][               D                ] |
         |  [C] [                                ] |
         +-----------------------------------------+

         (isReply)
         +-----------------------------------------+
         |      __________________________________ | <- [F]
         this.currentLineY ->|      [   ][A]                       [E] |
         |      [ B ][                           ] |
         |      [   ][             D             ] |
         |       [C] [                           ] |
         +-----------------------------------------+
         [A]	name
         [B]	avatar (32px x 32px)
         [C]	isTagged (display a star)	(16px x 16px)
         [D] comment
         [E] date
         [F] separator*/

        //	lets get our indent set up
        var fontSize = 12;
        var indentX = json.isReply ? 100 : 60;
        var lineOpacity = json.isReply ? 0.165 : 0.33;

        this.report.fontSize(fontSize); //lets put the opacity back

        //[F]: draw line - separator
        this.report.opacity(lineOpacity);
        this.report.moveTo(indentX, this.currentLineY - 4).lineTo(585, this.currentLineY - 4).stroke();
        this.report.opacity(1.0);
        var commentStartY = this.report.y;

        //[B]: draw head
        if(!isDescription){
            this.avatarDataDraw({
                object: "head",
                index: 0,
                view: {
                    x: ((indentX * 2) - 112),
                    y: ((this.currentLineY * 2) - 22),
                    width: 32,
                    height: 32
                }
            });
        }

        //[B]: draw emotion
        if(!isDescription){
            this.avatarDataDraw({
                object: "face",
                index: this.getEmotionIndex(json.emotion),
                view: {
                    x: ((indentX * 2) - 112),
                    y: ((this.currentLineY * 2) - 22),
                    width: 32,
                    height: 32
                }
            });
        }

        //[C]: draw tag
        if(!isDescription){
            if (json.isTagged)
                this.report.image(json.fsPath + 'resources/images/tag_set.png', (this.getPageWidth() - 5), (this.currentLineY + 12));
        }
        //[E]
        if(!isDescription){
            this.report.opacity(0.5);
            this.report.fontSize(fontSize - 3);
            this.report.text(dateFormat(json.date, "chat"), 10, this.currentLineY, {
                width: this.getPageWidth(),
                align: 'right'
            });
        }

        //[A]
        if(!isDescription){
            this.report.fontSize(fontSize);
            this.report.text(json.name, indentX, this.currentLineY);
            this.currentLineY = this.report.y;
        }

        //	[D] ([C])
        this.report.opacity(1.0);
        if (this.isUserFacilitator(json.userId))
            this.report.fillColor('#e51937');	//	IFS Red
        var t = this.report.text('\u201c' + json.comment + '\u201d', indentX, this.currentLineY + 22, {
            width: (this.getPageWidth() - indentX),
            align: 'left'
        });
        this.report.fillColor('black');

        //	make sure we update this
        this.report.moveDown();

        if (commentStartY > t.y) //means that comment started on the previous page
            this.formatCurrentPage();

        this.currentLineY = this.report.y;
    },

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    addWhiteboardObjectCSV: function (json) {
    },

    addWhiteboardObjectTXT: function (json) {
    },

    addWhiteboardObjectPDF: function (json) {
        //	did we pass the correct information?
        if (typeof json === "undefined") return;
        if (typeof json.fsPath === "undefined") return;
        if (typeof json.userId === "undefined") return;
        if (typeof json.name === "undefined") return;
        if (typeof json.cmd === "undefined") return;

        //	set up some defaults
        if (typeof json.isFirst === "undefined") json.isFirst = false;
        if (typeof json.isLast === "undefined") json.isLast = false;

        switch (json.cmd) {
            case "shareresource":
            {
                if (typeof json.event === "undefined") return;
                if (typeof json.event.id === "undefined") return;
                if (typeof json.event.type === "undefined") return;
                if (typeof json.event.target === "undefined") return;
                if (typeof json.event.content === "undefined") return;
                if (typeof json.event.actualSize === "undefined") return;
                if (typeof json.event.actualSize.width === "undefined") return;
                if (typeof json.event.actualSize.height === "undefined") return;
            }
                break;
            case "deleteall":
            {
                //	nothing to check for, just need the cmd
            }
                break;
            case "object":
            {
                if (typeof json.event === "undefined") return;
                if (typeof json.event.id === "undefined") return;
                if (typeof json.event.type === "undefined") return;
                if (typeof json.event.action === "undefined") return;

                //	set up some defaults (where needed)
                if (typeof json.event.path === "undefined") json.event.path = null;
                if (typeof json.event.attr === "undefined") json.event.attr = null;
                if (typeof json.event.para === "undefined") json.event.para = null;
                if (typeof json.event.bbox === "undefined") json.event.bbox = null;
                if (typeof json.event.transX === "undefined") json.event.transX = 0;
                if (typeof json.event.transY === "undefined") json.event.transY = 0;
                if (typeof json.event.scale === "undefined") {
                    json.event.scale = {
                        x: 1,
                        y: 1
                    }
                } else {
                    if (typeof json.event.scale.x === "undefined") json.event.scale.x = 1;
                    if (typeof json.event.scale.y === "undefined") json.event.scale.y = 1;
                }
            }
                break;
        }


        //	OK, fill this section with the required items
        /*
         please note, one drawing per page

         +-----------------------------------------+
         | [A] : [B]                               |
         | [        [                   ]        ] |
         | [        [                   ]        ] |
         | [        [        [C]        ]        ] |
         | [        [                   ]        ] |
         | [        [                   ]        ] |
         | [                                     ] |
         | [                 [D]                 ] |
         | [                                     ] |
         |                                         |
         +-----------------------------------------+

         [A]	session name
         [B]	topic name
         [C]	image (if one is present)
         [D] objects
         [E] date
         [F] separator
         */

        //	lets get our indent set up
        var fontSize = 12;

        //var lineHeight = (this.report._fontSize + (this.report._fontSize / 6.6666));	//	this seems to work for Arial anyway...

        this.report.fontSize(fontSize);

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        //	lets take care of our event now...
        switch (json.cmd) {	//	what kind of event do we have?
            //   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -
            case "shareresource":
            {
                var dimensions = this.getFittedDimensions(
                    json.event.actualSize.width,
                    json.event.actualSize.height,
                    this.getPageWidth() * 0.75,
                    this.getPageHeight() * 0.75
                );

                var imageX = ((this.getPageWidth() - dimensions.width) / 2);
                var imageY = ((this.getPageHeight() - dimensions.height) / 2);
                var filename = json.fsPath + 'uploads/' + json.event.content.substring(json.event.content.lastIndexOf('/') + 1);

                //	before we do anything with this image, lets see if it exists...
                fs.data = this;

                //	synchronous version
                if (fs.existsSync(filename)) {
                    fs.data.report.scale(0.8);
                    fs.data.report.image(filename, imageX + translateX, imageY + translateY, {fit: [dimensions.width, dimensions.height]});
                    fs.data.report.scale(1.25);
                }
            }
                break;

            //   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -
            case "deleteall":
            {
                //	firstly, do we need to create a new page?
                if (!this.justAddedNewPage) {
                    //this.report.translate(this.whiteboardOffsetX, this.whiteboardOffsetY);

                    this.formatCurrentPage();
                }
            }
                break;

            //   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -   -
            case "object":
            {
                var path = null,
                    attr = null;

                if (typeof json.event.path != 'undefined') {
                    path = json.event.path;
                    console.log(path);
                }


                if (typeof json.event.attr != 'undefined') {
                    console.log(json.event.attr);
                    attr = json.event.attr;
                }

                this.report.scale(0.8);

                if (attr) {
                    this.raphaelToPDFKitWithScale({
                        report: this.report,
                        path: path,
                        attribute: attr,
                        type: json.event.type,
                        bbox: json.event.bbox,
                        parameters: json.event.para,
                        transform: {
                            x: json.event.transX,
                            y: json.event.transY
                        },
                        offset: {
                            x: this.whiteboardOffsetX,
                            y: this.whiteboardOffsetY
                        },
                        rotate: json.event.rotate || 0,
                        scale: json.event.scale,
                        isFirst: json.isFirst,
                        isLast: json.isLast
                    });

                    //this.justAddedNewPage = false;
                }

                this.report.stroke();

                this.report.scale(1.25);
            }
                break;
        }

//        if (!this.justAddedNewPage) {
//            if (json.isLast) {
//                //this.report.translate(this.whiteboardOffsetX, this.whiteboardOffsetY);
//            }
//        }
    },

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /*
     json = {
     id: int,							//	{required} facilitator / participant id
     name: string,
     style: string,						//	"YesNoUnsure" || "StarRating"
     question: string,
     answer: string,
     date: object						//	{required} date object, when the vote was created,
     isLast: boolean						//	{default: false}, is this the last object?
     }
     */
    addVoteCSV: function (json) {
        //	did we pass the correct information?
        if (typeof json === "undefined") return;
        if (typeof json.userId === "undefined") return;
        if (typeof json.name === "undefined") return;
        if (typeof json.question === "undefined") return;
        if (typeof json.answer === "undefined") return;
        if (typeof json.date === "undefined") return;

        //	OK, fill this section with the required items
        if (this.isFirst) {
            this.report = "name, question, answer, date\n";
            this.isFirst = false;
        }
        this.report = this.report +
            json.name + "," +
            this.formatString(json.question) + "," +
            json.answer + "," +
            json.date + "\n";
    },

    addVoteTXT: function (json) {
        //	did we pass the correct information?
        if (typeof json === "undefined") return;
        if (typeof json.userId === "undefined") return;
        if (typeof json.name === "undefined") return;
        if (typeof json.question === "undefined") return;
        if (typeof json.answer === "undefined") return;
        if (typeof json.date === "undefined") return;

        //	OK, fill this section with the required items
        //	OK, fill this section with the required items
        if (this.isFirst) {
            this.report = this.session + " / " + this.topic + "\n\n";
            this.isFirst = false;
        }
        this.report = this.report +
            "name:\t" + json.name + "\n" +
            "question:\t" + json.question + "\n" +
            "answer:\t" + json.answer + "\n" +
            "date:\t" + json.date + "\n\n";
    },

    addVotePDF: function (json) {
        //	did we pass the correct information?
        if (typeof json === "undefined") return;
        if (typeof json.fsPath === "undefined") return;
        if (typeof json.userId === "undefined") return;
        if (typeof json.name === "undefined") return;
        if (typeof json.question === "undefined") return;
        if (typeof json.answer === "undefined") return;
        if (typeof json.date === "undefined") return;

        /*------------------------------------------
         this.firstQuestion->| _______________________________________ | <- separator [F]
         | [C]                                     |
         | [A] [D]                             [E] |
         +-----------------------------------------+
         otherwise
         +-----------------------------------------+
         | [A] [D]                             [E] |
         +-----------------------------------------+

         [A]	name
         [B]	style
         [C]	question
         [D] answer
         [E] date
         [F] separator*/

        //	lets get our indent set up
        var indentX = 60;
        var indentAnswerX = 250;
        var fontSize = 12;
        var lineOpacity = 0.33;

        var commentStartY = this.report.y;

        //	lets put the opacity back
        this.report.fontSize(fontSize);

        if (json.isFirst) {
            //	[F]
            this.report.opacity(lineOpacity);
            this.report.moveTo(indentX, this.currentLineY - 4).lineTo(this.getPageWidth(), this.currentLineY - 4).stroke();
            this.report.opacity(1.0);
            var commentStartY = this.report.y;

            //	[C]
            this.report.fontSize(fontSize);
            this.report.text(json.question, indentX, commentStartY);
            this.report.moveDown();
            this.currentLineY = this.report.y;
        }

        //	[E]
        this.report.opacity(0.5);
        this.report.fontSize(fontSize - 3);
        this.report.text(dateFormat(json.date, "chat"), 10, this.currentLineY, {
            width: this.getPageWidth(),
            align: 'right'
        });

        //	[A]
        this.report.fontSize(fontSize);
        this.report.text(json.name, indentX, this.currentLineY);

        //	[D]
        this.report.fontSize(fontSize);
        var t = this.report.text(json.answer, indentAnswerX, this.currentLineY);

        this.report.moveDown();

        if (commentStartY > t.y) //means that comment started on the previous page
            this.formatCurrentPage();

        this.currentLineY = this.report.y;
    },

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    /*
     json = {
     userId: int,
     count: int,
     topicId: int,
     topicName: string,
     name: string,						//	{required} facilitator / participant name
     isFirst: boolean,					//	{default: false} is this the first item to display?
     isLast: boolean						//	{default: false}, is this the last object?
     }
     */
    addStatsCSV: function (json) {
        //	did we pass the correct information?
        if (typeof json === "undefined") return;
        if (typeof json.userId === "undefined") return;
        if (typeof json.count === "undefined") return;
        if (typeof json.topicId === "undefined") return;
        if (typeof json.topicName === "undefined") return;
        if (typeof json.name === "undefined") return;

        //	OK, fill this section with the required items
        if (this.isFirst) {
            this.report = "topic, name, count\n";
            this.isFirst = false;
        }
        this.report = this.report +
            json.topicName + "," +
            json.name + "," +
            json.count + "\n";
    },

    addStatsTXT: function (json) {
        //	did we pass the correct information?
        if (typeof json === "undefined") return;
        if (typeof json.userId === "undefined") return;
        if (typeof json.count === "undefined") return;
        if (typeof json.topicId === "undefined") return;
        if (typeof json.topicName === "undefined") return;
        if (typeof json.name === "undefined") return;

        //	OK, fill this section with the required items
        //	OK, fill this section with the required items
        if (this.isFirst) {
            this.report = this.session + "\n\n";
            this.isFirst = false;
        }
        this.report = this.report +
            "topic:\t" + json.topicName + "\n" +
            "name:\t" + json.name + "\n" +
            "count:\t" + json.count + "\n\n";
    },

    addStatsPDF: function (json) {
        var err = joi.validate(json, {
            fsPath: joi.string().required(),
            userId: joi.number().required(),
            count: joi.number().required(),
            topicId: joi.number().required(),
            topicName: joi.string().required(),
            name: joi.string().required(),
            isLast: joi.boolean().optional(),
            isFirst: joi.boolean().optional()
        });

        if (err)
            throw err;

        json = _.defaults(_.clone(json || {}), {
            isFirst: false,
            isLast: false
        });

        /*-----------------------------------------+
         | [    A    ] [    B    ] [ C ]           |
         | _______________________________________ | <- separator [G]
         | [    D    ] [    E    ] [ F ]           |
         |         ...                             |
         | [    D    ] [    E    ] [ F ]           |
         +-----------------------------------------+

         [A]	label for [D]
         [B]	label for [E]
         [C]	label for [F]
         [D]	topic name
         [E]	name
         [F]	count
         [G] separator*/

        //we want to be sure there is enough space (30px) to be displayed. if there is no space, create new page.
        if (this.newPageY - this.report.y < 30) {
            this.report.addPage();
            this.formatCurrentPage();
        }

        var indentX = 60;
        var fontSize = 12;
        var lineOpacity = 0.33;

        this.report.fontSize(fontSize);

        //	[A] [B] & [C]
        if (this.isFirst) {
            this.report.text("Topic", indentX, this.currentLineY);
            this.report.text("Name", indentX + 200, this.currentLineY);
            this.report.text("Count", indentX + 400, this.currentLineY);

            this.report.moveDown();
            this.currentLineY = this.report.y;

            //	[G]
            this.report.opacity(lineOpacity);
            var offsetSeparatorY = 0;

            this.report.moveTo(indentX, this.currentLineY + offsetSeparatorY).lineTo(585, this.currentLineY + offsetSeparatorY).stroke();
            this.report.opacity(1.0);

            this.currentLineY += 8;

            this.isFirst = false;
            this.lastTopic = null;
        }

        //[D] [E] & [F]
        if (this.lastTopic != json.topicName) {
            this.currentLineY = this.report.y += 10;
            this.report.text(json.topicName, indentX, this.currentLineY);
            this.lastTopic = json.topicName;
        }

        var commentStartY = this.report.y;
        this.report.text(json.name, indentX + 200, this.currentLineY);
        var t = this.report.text(json.count, indentX + 400, this.currentLineY);
        //this.report.moveDown();

        this.currentLineY = this.report.y;

        if (commentStartY > t.y) {//means that comment started on the previous page
            this.formatCurrentPage();
            this.isFirst = true;
        }
    },

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    save: function () {
        if (this.type === 'PDF') {
            this.report.write(this.saveAs);
        } else {
            //	lets write the raw file out
            fs.writeFile(this.saveAs, this.report);
        }
    },

    getSaveAs: function () {
        return this.saveAs;
    },

    getLinkTo: function () {
        return this.linkTo;
    }
}

//-----------------------------------------------------------------------------
//	set up our array of avatar objects
//	we have our
//	accessories
//	desks
//	hairs
//	heads
//	tops

getAvatarData = function (part) {
    var adl = avatarData.length;

    for (var ndx = 0; ndx < adl; ndx++) {
        if (avatarData[ndx].name === part) return avatarData[ndx];
    }

    return {};
}
