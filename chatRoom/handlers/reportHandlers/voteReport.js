var mtypes = require('../helpers/mtypes');
var getReportData_Voting = require('../getReportData_Voting.js');
var config = require('../../config/config.json');
var FS_PATH = config.paths.fsPath + config.paths.chatRoomPath;

module.exports.getReportInfo = function (params) {
    return {
        title: "Voting - " + params.report.brand,
        layout: mtypes.pageOrientation.portrait
    };
}

module.exports.getReportData = function (params, resCb, nextCb) {
    var req = {
        topicId: params.topicID
    };

    if (!params.includeFacilitator)
        req.sessionStaffTypeToExclude = mtypes.userType.facilitator;

    getReportData_Voting.execute(req, resCb, nextCb);
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
            fsPath: FS_PATH,
            userId: rowData.userId,
            name: rowData.firstName,

            date: new Date(rowData.created),
            isFirst: i == 0,
            isLast: i == data.length - 1
        };

        if (rowEvent) {
            rowObject.style = rowEvent.style;
            rowObject.question = rowEvent.question;
            rowObject.answer = rowEvent.answer;
        }

        result.push(rowObject);
    }

    return result;
};

module.exports.getReportResult = function (report, rowObjects) {
    for (var i = 0; i < rowObjects.length; i++) {
        var rowObject = rowObjects[i];

        switch (report.type.toLowerCase()) {
            case 'csv':
                report.addVoteCSV(rowObject);
                break;
            case 'txt':
                report.addVoteTXT(rowObject);
                break;
            default:
                report.addVotePDF(rowObject);
                break;
        }
    }

    return report;
}
