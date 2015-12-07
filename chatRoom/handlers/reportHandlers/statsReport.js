var mtypes = require('if-common').mtypes;
var getReportData_Statistics = require('../getReportData_Statistics.js');
var config = require('../../config/config.json');
var FS_PATH = config.paths.fsPath + config.paths.chatRoomPath;

module.exports.getReportInfo = function (params) {
    return {
        title: "Whiteboard History - " + params.report.brand,
        layout: mtypes.pageOrientation.portrait
    };
}

module.exports.getReportData = function (params, resCb, nextCb) {
    var req = {
        sessionId: params.sessionID
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
            name: rowData.name_first,
            userId: rowData.userId,
            fsPath: FS_PATH,
            count: rowData.count_userId,
            topicId: rowData.topicId,
            topic_name: rowData.topic_name
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