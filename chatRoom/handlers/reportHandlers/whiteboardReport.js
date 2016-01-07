var mtypes = require('./../../helpers/mtypes');
var getReportData_Whiteboard = require('../getReportData_Whiteboard.js');
var config = require('config').get("chatConf");
var FS_PATH = config.paths.fsPath + config.paths.chatRoomPath;

module.exports.getReportInfo = function (params) {
    return {
        title: "Whiteboard History - " + params.report.brand,
        layout: mtypes.pageOrientation.landscape
    };
}

module.exports.getReportData = function (params, resCb, nextCb) {
    getReportData_Whiteboard.execute({
        topicId: params.topicID
    }, resCb, nextCb);
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
            tag: rowData.tag,
            cmd: rowData.cmd,
            event: rowEvent
        };

        result.push(rowObject);
    }

    return result;
};

module.exports.getReportResult = function (report, rowObjects) {
    for (var i = 0; i < rowObjects.length; i++) {
        var rowObject = rowObjects[i];
        report.addWhiteboardObjectPDF(rowObject);
    }

    clearArea(report, "M-50,-100L1002,-100L1002,0L-50,0Z");
    clearArea(report, "M-50,460L1002,460L1002,644L-50,644Z");
    clearArea(report, "M-50,0L0,0L0,460L-50,460Z");
    clearArea(report, "M949,0L1002,0L1002,460L949,460Z");

    var fparams = {
        pageNumberRequired: false,
        dateRequired: false,
        margins: {
            bottom: 5,
            left: 5,
            right: 5,
            top: 5
        }
    };
    report.formatCurrentPage(fparams);

    return report;
}

var clearArea = function (report, coordinates) {
    var bottom = {
        cmd: "object",
        event: {
            action: "draw",
            attr: {
                fill: "white",
                stroke: "white",
                "stroke-width": 1,
                title: ""
            },
            bbox: {
                height: 192,
                width: 305,
                x: 221,
                y: 227
            },
            id: "",
            name: "",
            para: [221, 227, 305, 192],
            path: coordinates,
            strokeWidth: 1,
            type: "rectangle-fill"
        },
        fsPath: config.paths.fsPath,
        isFirst: false,
        isLast: true,
        name: "",
        tag: 16,
        userId: null
    };

    report.addWhiteboardObjectPDF(bottom);
}
