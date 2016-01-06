var mtypes = require('./../../helpers/mtypes');
var getSessionStaffUserIds = require('../getSessionStaffUserIds.js');
var config = require('config').get("chatConf");
var FS_PATH = config.paths.fsPath + "/" + config.paths.chatRoomPath;
var URL_PATH = config.paths.urlPath + "/" + config.paths.chatRoomPath;

module.exports = function (params, resCb, nextCb) {
    var getSessionStaffUserIdsCb = function (sessionStaffIds) {
        try {
            var reportHandler = getReportHandler(params.report.type);
            var reportInfo = reportHandler.getReportInfo(params);
            var report = require('./../../lib/reports');
            report.init({
                type: params.type,
                includeFacilitator: params.includeFacilitator,
                facilitatorList: sessionStaffIds,
                report: {
                    title: reportInfo.title,
                    saveAs: params.report.type + '-' + params.report.session + '-' + params.report.topic,
                    fsPath: FS_PATH,
                    urlPath: URL_PATH,
                    type: params.report.type
                },
                ifs: {
                    sessionId: params.sessionId,
                    session: params.report.session,
                    topicId: params.topicId,
                    topic: params.report.topic
                },
                page: {
                    title: reportInfo.title,
                    layout: reportInfo.layout
                }
            });
            var getReportDataCb = function (data) {
                var reportRows = reportHandler.getReportRowObjects(data, nextCb);
                report = reportHandler.getReportResult(report, reportRows);
                report.save();

                var result = {
                    saveAs: report.getSaveAs(),
                    urlPath: report.getLinkTo()
                };

                resCb(result);
            }
            reportHandler.getReportData(params, getReportDataCb, nextCb);
        }
        catch (ex) {
            nextCb(ex);
        }
    }

    getSessionStaffUserIds.execute({
        type: 'facilitator'
    }, getSessionStaffUserIdsCb, nextCb);
}

function getReportHandler(type) {
    switch (type) {
        case 'chat':
        case 'chat_stars':
            return require("./chatHistoryReport.js");
            break;

        case 'whiteboard':
            return require("./whiteboardReport.js");

        case 'vote':
            return require("./voteReport.js");
            break;

        case 'stats':
            return require("./statsReport.js");

        default:
            throw "Report type is unknown";
    }
}
