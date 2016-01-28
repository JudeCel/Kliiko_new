var mtypes = require('./../../helpers/mtypes');
var getReportData_Statistics = require('../getReportData_Statistics.js');
var config = require('config').get("chatConf");
var FS_PATH = config.paths.fsPath + "/" + config.paths.chatRoomPath;

module.exports.getReportInfo = function (params) {
    return {
        title: "Whiteboard History - " + params.report.brand,
        layout: mtypes.pageOrientation.portrait
    };
}

module.exports.getReportData = function (params, resCb, nextCb) {
    var req = {
        sessionId: params.sessionId
    };

    getReportData_Statistics.execute(req, resCb, nextCb);
}

module.exports.getReportRowObjects = function (data, nextCb) {
    var result = [];
    for (var i = 0; i < data.length; i++) {
        var rowData = data[i];
        var rowEvent = null;
        if (rowData.event)
            try {
                rowEvent = JSON.parse(decodeURI(rowData.event), null);
            }
            catch (ex) {
                nextCb(ex);
            }

        var rowObject = {
            isFirst: i == 0,
            isLast: i == data.length - 1,
            name: rowData.firstName,
            userId: rowData.userId,
            fsPath: FS_PATH,
            count: rowData.countUserId,
            topicId: rowData.topicId,
            topicName: rowData.topicName
        };

        result.push(rowObject);
    }

    return result;
};

module.exports.getReportResult = function (report, rowObjects) {
    for (var i = 0; i < rowObjects.length; i++) {
        var rowObject = rowObjects[i];

        switch (report.type.toLowerCase()) {
            case 'csv':
                report.addStatsCSV(rowObject);
                break;
            case 'txt':
                report.addStatsTXT(rowObject);
                break;
            default:
                report.addStatsPDF(rowObject);
                break;
        }
    }

    return report;
}