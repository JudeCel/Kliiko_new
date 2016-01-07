var mtypes = require('./../../helpers/mtypes');
var getReportData_ChatHistory = require('../getReportData_ChatHistory.js');
var config = require('config').get("chatConf");
var FS_PATH = config.paths.fsPath + "/" +config.paths.chatRoomPath;
var S = require('string');

function getPrefix(params) {
    switch (params.report.type) {
        case 'chat':
            return "Chat History - ";
        case 'chat_stars':
            return "Chat History (Stars only) - ";
    }
}

module.exports.getReportInfo = function (params) {
    return {
        title: getPrefix(params) + params.report.brand,
        layout: mtypes.pageOrientation.portrait
    };
}

module.exports.getReportData = function (params, resCb, nextCb) {
    var req = {
        topicId: params.topicID
    };

    if (!params.includeFacilitator)
        req.sessionStaffTypeToExclude = 'facilitator';

    if (params.report.type == 'chat_stars')
        req.starsOnly = true;

    getReportData_ChatHistory.execute(req, resCb, nextCb);
}

module.exports.getReportRowObjects = function (data, nextCb) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        var rowData = data[i];
        var rowObject = {
            isFirst: i == 0,
            isLast: i == data.length - 1,
            isReply: false,
            isTagged: rowData.tag === 1,
            name: rowData.firstName,
            userId: rowData.userId,
            fsPath: FS_PATH
        };

        var rowEvent = null;
        if (rowData.event){
            if(rowData.userId == 0){
                rowObject.isReply = false;
                //rowData.event=rowData.event.replace(/<!--(.|\n)*-->/g,""); //didn't work. figure out why, and fix it- it'll improve performance.
                while (rowData.event.indexOf("<!--")>-1)
                    rowData.event=rowData.event.substr(0,rowData.event.indexOf("<!--")-1)+rowData.event.substr(rowData.event.indexOf("-->",rowData.event.indexOf("<!--"))+1);
                var txt = S(rowData.event).stripTags().s;
                rowObject.comment = S(txt).decodeHTMLEntities().s;
                rowObject.date = new Date();
                if (txt=='')
                    continue;
            }else {
                try {
                    rowEvent = JSON.parse(decodeURI(rowData.event), null);
                }
                catch (ex) {
                    nextCb(ex);
                }

                if (rowEvent)
                    if (rowEvent.object) {
                        if (rowEvent.object.mode)
                            rowObject.isReply = rowEvent.object.mode.type === "reply";

                        rowObject.comment = rowEvent.object.input;
                        rowObject.emotion = rowEvent.object.emotion;
                        rowObject.date = new Date(rowEvent.object.date);
                    }
            }

        result.push(rowObject);
        }

    }

    return result;
};

module.exports.getReportResult = function (report, rowObjects) {
    for (var i = 0; i < rowObjects.length; i++) {
        var rowObject = rowObjects[i];

        switch (report.type.toLowerCase()) {
            case 'csv':
                report.addChatHistoryCSV(rowObject);
                break;
            case 'txt':
                report.addChatHistoryTXT(rowObject);
                break;
            default:
                report.addChatHistoryPDF(rowObject);
                //var stats = report.getPDFStats();
                break;
        }
    }

    return report;
}
