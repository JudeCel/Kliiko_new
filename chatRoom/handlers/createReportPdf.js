//"use strict";
//var _ = require('lodash');
//var ifData = require('if-data');
//var mtypes = require('if-common').mtypes;
//var webFaultHelper = require('../helpers/webFaultHelper.js');
//var expressValidatorStub = require('../tests/testHelpers/expressValidatorStub.js');
//var joi = require('joi');
//
//var FS_PATH = "";
//var URL_PATH = "";
//
//module.exports.validate = function (req, resCb) {
//    var err = joi.validate(req.params, {
//        report: joi.types.Object().required(),
//        type: joi.string().required(),
//        sessionID: joi.number(),
//        topicID: joi.number(),
//        userID: joi.number(),
//	    includeFacilitator: joi.types.Boolean()
//    });
//
//    if (err)
//        return resCb(webFaultHelper.getValidationFault(err.error));
//
//    resCb();
//};
//
//module.exports.run = function (req, resCb, errCb) {
//    var config = require('../config/config.json');
//    FS_PATH = config.paths.fsPath + config.paths.chatRoomPath;
//    URL_PATH = config.paths.urlPath + config.paths.chatRoomPath;
//
//    req.params = _.defaults(_.clone(req.params || {}), {
//        includeFacilitator: false
//    });
//
//    req.params.report = _.defaults(_.clone(req.params.report || {}), {
//        format: "PDF",
//        brand: "Untitled",
//        session: "Untitled",
//        topic: "Untitled"
//    });
//
//    getReportSessionStaff();
//
//    function getReportSessionStaff() {
//        var cmdResCb = {
//            send: getReportObject
//        }
//
//        var cmdRec = expressValidatorStub({
//            params: {
//                type_id: mtypes.userType.facilitator
//            }
//        });
//
//        var cmd = require('../handlers/getSessionStaffUserIds.js');
//        cmd.validate(cmdRec, function (err) {
//            if (err) return errCb(err);
//            cmd.run(cmdRec, cmdResCb, errCb);
//        });
//    }
//
//    function getReportObject(sessionStaffIds) {
//        var report = require('if-reports');
//        var layout = "";
//        var title = ""
//
//        switch (req.params.report.type) {
//            case "chat":
//                layout = "portrait";
//                title = "Chat History - " + req.params.report.brand;
//                break;
//
//            case "chat_stars":
//                layout = "portrait";
//                title = "Chat History (Stars only) - " + req.params.report.brand;
//                break;
//
//            case "whiteboard":
//                layout = "landscape";
//                title = "Whiteboard History - " + req.params.report.brand;
//                break;
//
//            case "vote":
//                layout = "portrait";
//                title = "Voting - " + req.params.report.brand;
//                break;
//
//            case "stats":
//                layout = "portrait";
//                title = "Statistics - " + req.params.report.brand;
//                break;
//        }
//
//        report.init({
//            type: req.params.type,
//            includeFacilitator: req.params.includeFacilitator,
//            facilitatorList: sessionStaffIds,
//            report: {
//                title: title,
//                saveAs: req.params.report.type + '-' + req.params.report.session + '-' + req.params.report.topic,
//                fsPath: FS_PATH,
//                urlPath: URL_PATH
//            },
//            ifs: {
//                sessionId: req.params.sessionID,
//                session: req.params.report.session,
//                topicId: req.params.topicID,
//                topic: req.params.report.topic
//            },
//            page: {
//                header: title,
//                layout: layout
//            }
//        });
//
////        report.addNewPage({
////            fsPath: FS_PATH,
////            createNewPage: false,
////            includeLogo: true
////        });
//
//        getReportData(report);
//    }
//
//    function getReportData(report) {
//        var cmdResCb = {
//            send: function(data) {
//	            getReportResult(report, data);
//            }
//        }
//
//        switch (req.params.report.type) {
//            case "chat":
//            case "chat_stars":
//                var cmdReq = expressValidatorStub({
//                    params: {
//                        topicId: req.params.topicID
//                    }
//                });
//
//                if (!req.params.includeFacilitator)
//                    cmdReq.sessionStaffTypeToExclude = mtypes.userType.facilitator;
//
//                if (req.params.report.type == "chat_stars")
//                    cmdReq.starsOnly = true;
//
//                var cmd = require("../handlers/getReportData_ChatHistory.js");
//                cmd.validate(cmdReq, function (err) {
//                    if (err) return errCb(err);
//                    cmd.run(cmdReq, cmdResCb, errCb);
//                });
//                break;
//
//            case "whiteboard":
//                var cmdReq = expressValidatorStub({
//                    params: {
//                        topicId: req.params.topicID
//                    }
//                });
//
//                var cmd = require("../handlers/getReportData_Whiteboard.js");
//                cmd.validate(cmdReq, function (err) {
//                    if (err) return errCb(err);
//                    cmd.run(cmdReq, cmdResCb, errCb);
//                });
//                break;
//
//            case "vote":
//                var cmdReq = expressValidatorStub({
//                    params: {
//                        topicId: req.params.topicID
//                    }
//                });
//
//                if (!req.params.includeFacilitator)
//                    cmdReq.sessionStaffTypeToExclude = mtypes.userType.facilitator;
//
//                var cmd = require("../handlers/getReportData_Voting.js");
//                cmd.validate(cmdReq, function (err) {
//                    if (err) return errCb(err);
//                    cmd.run(cmdReq, cmdResCb, errCb);
//                });
//                break;
//
//            case "stats":
//                var cmdReq = expressValidatorStub({
//                    params: {
//                        sessionId: req.params.sessionID
//                    }
//                });
//
//                if (!req.params.includeFacilitator)
//                    cmdReq.sessionStaffTypeToExclude = mtypes.userType.facilitator;
//
//                var cmd = require("../handlers/getReportData_Statistics.js");
//                cmd.validate(cmdReq, function (err) {
//                    if (err) return errCb(err);
//                    cmd.run(cmdReq, cmdResCb, errCb);
//                });
//                break;
//        }
//    }
//
//    function getReportResult(report, data) {
//        for (var i = 0; i < data.length; i++) {
//            var rowObject = {
//                isFirst: i == 0,
//                isLast: i == data.length - 1,
//                name: data[i].name_first,
//                userId: data[i].userId,
//                fsPath: FS_PATH
//            };
//            var rowData = data[i];
//
//            var rowEvent = null;
//            if (rowData.event)
//                rowEvent = JSON.parse(decodeURI(rowData.event), null);
//
//            switch (req.params.report.type) {
//                case "chat":
//                case "chat_stars":
//                    rowObject.isTagged = rowData.tag === 1;
//                    rowObject.isReply = false;
//
//                    if (rowEvent)
//                        if (rowEvent.object) {
//                            if (rowEvent.object.mode)
//                                rowObject.isReply = rowEvent.object.mode.type === "reply";
//
//                            rowObject.comment = rowEvent.object.input;
//                            rowObject.emotion = rowEvent.object.emotion;
//                            rowObject.date = new Date(rowEvent.object.date);
//                        }
//                    switch (json.type.toLowerCase()) {
//                        case 'csv':
//                            report.addChatHistoryCSV(rowObject);
//                            break;
//                        case 'txt':
//                            report.addChatHistoryTXT(rowObject);
//                            break;
//                        default: 	//	pdf
//                            report.addChatHistoryPDF(rowObject);
//                            break;
//                    }
//
//                    break;
//
//                case "whiteboard":
//                    rowObject.tag = rowData.tag;
//                    rowObject.cmd = rowData.cmd;
//                    rowObject.event = rowEvent;
//
//                    if (rowData.created)
//                        rowObject.date = new Date(rowData.created);
//
//                    switch (req.params.type.toLowerCase()) {
//                        case 'csv':
//                            report.addWhiteboardObjectCSV(rowObject);
//                            break;
//                        case 'txt':
//                            report.addWhiteboardObjectTXT(rowObject);
//                            break;
//                        default:
//                            report.addWhiteboardObjectPDF(rowObject);
//                            break;
//                    }
//                    break;
//
//                case "vote":
//                    if (rowEvent) {
//                        rowObject.style = rowEvent.style;
//                        rowObject.question = rowEvent.question;
//                        rowObject.answer = rowEvent.answer;
//                    }
//
//                    if (rowData.created)
//                        rowObject.date = new Date(rowData.created);
//
//                    switch (json.type.toLowerCase()) {
//                        case 'csv':
//                            report.addVoteCSV(rowObject);
//                            break;
//                        case 'txt':
//                            report.addVoteTXT(rowObject);
//                            break;
//                        default: 	//	pdf
//                            report.addVotePDF(rowObject);
//                            break;
//                    }
//                    break;
//
//                case 'stats':
//                    rowObject.count = rowData.count_userId;
//                    rowObject.topicId = rowData.topicId;
//                    rowObject.topic_name = rowData.topic_name;
//
//                    switch (json.type.toLowerCase()) {
//                        case 'csv':
//                            report.addStatsCSV(rowObject);
//                            break;
//                        case 'txt':
//                            report.addStatsTXT(rowObject);
//                            break;
//                        default: 	//	pdf
//                            report.addStatsPDF(rowObject);
//                            break;
//                    }
//            }
//        }
//
//        report.save();
//
//        var result = {
//            saveAs: report.getSaveAs(),
//            urlPath: report.getLinkTo()
//        };
//
//        resCb.send(result);
//    }
//}