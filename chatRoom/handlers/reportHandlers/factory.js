var mtypes = require('../helpers/mtypes');
var getSessionStaffUserIds = require('../getSessionStaffUserIds.js');
var config = require('../../config/config.json');
var FS_PATH = config.paths.fsPath + config.paths.chatRoomPath;
var URL_PATH = config.paths.urlPath + config.paths.chatRoomPath;

module.exports = function (params, resCb, nextCb) {
    var getSessionStaffUserIdsCb = function (sessionStaffIds) {
        try {
            var reportHandler = getReportHandler(params.report.type);
            var reportInfo = reportHandler.getReportInfo(params);
            var report = require('if-reports');

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
                    sessionId: params.sessionID,
                    session: params.report.session,
                    topicId: params.topicID,
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
        type_id: mtypes.userType.facilitator
    }, getSessionStaffUserIdsCb, nextCb);
}

function getReportHandler(type) {
    switch (type) {
        case mtypes.reportType.chat:
        case mtypes.reportType.chat_stars:
            return require("./chatHistoryReport.js");
            break;

        case mtypes.reportType.whiteboard:
            return require("./whiteboardReport.js");

        case mtypes.reportType.vote:
            return require("./voteReport.js");
            break;

        case mtypes.reportType.stats:
            return require("./statsReport.js");

        default:
            throw "Report type is unknown";
    }
}
