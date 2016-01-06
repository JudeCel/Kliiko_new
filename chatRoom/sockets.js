"use strict";
var mtypes = require('./helpers/mtypes');
var socketio = require('socket.io');
var express = require('express');
var config = require('config'); // need replace with orginal config
var conflict = 'drop current';
var expressValidatorStub = require('./helpers/expressValidatorStub.js');
var currentUser = require('../middleware/currentUser');

var io;
var _ = require('lodash');

module.exports.io = function () {
  return io;
}

module.exports.addRoutes = function (app) {
  let chatRoute = require('./routes/chat');

  app.use('/chat_room', express.static(__dirname + '/chat_room'));
  app.use('/onsocket', express.static(__dirname + '/onsocket'));
  app.use('/bootstrap', express.static(__dirname + '/bootstrap'));
  app.use('/chat_room', express.static(__dirname + '/public'));

  app.use('/chat', currentUser.assign, chatRoute);
  return app
}

module.exports.listen = function (server) {
  io = require('socket.io')(server);
  io = io.of('/chat');

  var socketHelper = require('./socketHelper');


  var userids = [];
  var nameList = new Array();
  var globalVars = {
    topicId: 0,
    userId: 0
  };

  io.on('connection', function (socket) {
    socket.on('config_get_info', function (sessionId) {
      var req = expressValidatorStub({
        params: {
          sessionId: sessionId
        }
      });

      var resCb = function (result) {
        io.connected[socket.id].emit('config_info', config.get('chatConf'), result.dataValues);
      };

      var nextCb = function (err) {
        // TBD
      };

      var res = { send: resCb };

      var getSessionPreferences = require('./handlers/getSessionPreferences.js');
      getSessionPreferences.validate(req, function (err) {
        if (err) return nextCb(err);
        getSessionPreferences.run(req, res, nextCb);
      });
    });

    socket.on('sendchat', function (data) {
      console.log('sendchat');

      if (data == null) return;
      var chatAsJSON = JSON.stringify({name: socket.username, object: data}, null);
      socketHelper.createCustomEvent(data.topicId, socket.userId, "chat", chatAsJSON);
    });

    socket.on('editchat', function (id, tag, user, data) {
      console.log('editchat');

      if (data == null) return;
      if (user != socket.userId) return;

      var chatAsJSON = JSON.stringify({name: socket.username, object: data}, null);
      socketHelper.updateCustomEvent(data.topicId, socket.userId, id, tag, "chat", chatAsJSON, function(){
        io.emit('updatechatcontent', id, data.input);
      });
    });

    socket.on('updateTopic', function (topicId, topicDescription) {
      console.log('updateTopic');

      if (topicId == null) return;

      var req = expressValidatorStub({
        params: {
          topicId: topicId,
          description: topicDescription
        }
      });

      var resCb = function (result) {
        io.emit('updateBillboard', socket.userId, socket.topicId, topicDescription);
      };

      var nextCb = function (err) {
        // TBD
      };

      var res = { send: resCb };

      var updateTopic = require('./handlers/updateTopic.js');
      updateTopic.validate(req, function (err) {
        if (err) return nextCb(err);
        updateTopic.run(req, res, nextCb);
      });
    });

    socket.on('insert_offline_transactions', function (replyUserId, message_id) {
      console.log('insert_offline_transactions');

      if (replyUserId == null || message_id == null) return;

      //	lets process our reply
      var keys = Object.keys(io.sockets);
      var found = false;
      var updateDB = false;
      for (var ndxSocket = 0, nk = keys.length; ndxSocket < nk; ndxSocket++) {
        var currentSocket = io.sockets[keys[ndxSocket]];
        if (currentSocket.userId == replyUserId) {
          if (currentSocket.topicId != socket.topicId) {
            updateDB = true;
          }
          found = true;
          break;
        }
      }

      if (!found) {
        updateDB = true;
      }

      if (updateDB) {
        var req = expressValidatorStub({
          params: {
            userId: socket.userId,
            sessionId: socket.sessionId,
            topicId: socket.topicId,
            replyUserId: replyUserId,
            message_id: message_id
          }
        });

        var nextCb = function (err) {
          // TBD
        };

        var res = { send: null };

        var createOfflineTransactions = require('./handlers/createOfflineTransactions');
        createOfflineTransactions.validate(req, function (err) {
          if (err) return nextCb(err);
          createOfflineTransactions.run(req, res, nextCb);
        });
      }
    });

    socket.on('get_offline_transactions', function (sessionId, replyUserId) {
      console.log('get_offline_transactions');


      var req = expressValidatorStub({
        params: {
          sessionId: sessionId,
          replyUserId: replyUserId
        }
      });

      var resCb = function (result) {
        if (!result) return;
        var resultStr = JSON.stringify(result);
        io.connected[socket.id].emit('offlinetransactions', resultStr);
      };

      var nextCb = function (err) {
        // TBD
      };

      var res = { send: resCb };

      var getOfflineTransactions = require('./handlers/getOfflineTransactions.js');
      getOfflineTransactions.validate(req, function (err) {
        if (err) return nextCb(err);
        getOfflineTransactions.run(req, res, nextCb);
      });
    });

    socket.on('delete_offline_transactions', function (topicId, replyUserId) {
      console.log('delete_offline_transactions');


      var req = expressValidatorStub({
        params: {
          topicId: topicId,
          replyUserId: replyUserId
        }
      });

      var nextCb = function (err) {
        // TBD
      };

      var res = { send: function () {
      } };

      var deleteOfflineTransactions = require('./handlers/deleteOfflineTransactions.js');
      deleteOfflineTransactions.validate(req, function (err) {
        if (err) return nextCb(err);
        deleteOfflineTransactions.run(req, res, nextCb);
      });
    });

    socket.on('sendobject', function (data, all) {
      console.log('sendobject');


      if (data == null || data.action == null) return;
      if (all == null) all = false;			//	default to false

      var userId = socket.userId;
      if (all) userId = -1;									//	make sure everyone gets this message

      switch (data.action) {
        case 'deleteAll':
          socketHelper.deleteAllEvents(socket.topicId); //remove everything on the screen (this obviously cannot be undone "easily")...
        break;
        default:
          socketHelper.updateEvent(socket.topicId, userId, data); //lets save this to the events table
        break;
      }

      //	make sure we broadcast this object back to everyone else...
      io.emit('updatecanvas', userId, socket.topicId, data);
    });

    socket.on('undo', function (data) {
      console.log('undo');

      var req = expressValidatorStub({
        params: {
          eventId: data.id
        }
      });

      var nextCb = function (err) {
        // TBD
      };

      var res = { send: null };

      var deleteEvent = require('./handlers/deleteEvent.js');
      deleteEvent.validate(req, function (err) {
        if (err) return nextCb(err);
        deleteEvent.run(req, res, nextCb);
      });

      res = {
        send: function (result) {
          if (!result) return;
          var resultStr = JSON.stringify(result);
          io.emit('updateundo', socket.username, socket.topicId, resultStr);
        }
      };

      var getEvent = require('./handlers/getEvent.js');
      getEvent.validate(req, function (err) {
        if (err) return nextCb(err);
        getEvent.run(req, res, nextCb);
      });
    });

    socket.on('redo', function (data) {
      console.log('redo');

      var req = expressValidatorStub({
        params: {
          eventId: data.id
        }
      });

      var nextCb = function (err) {
        // TBD
      };

      var res = { send: null };

      var unArchiveEvent = require('./handlers/unArchiveEvent.js');
      unArchiveEvent.validate(req, function (err) {
        if (err) return nextCb(err);
        unArchiveEvent.run(req, res, nextCb);
      });

      res = {
        send: function (result) {
          if (!result) return;
          var resultStr = JSON.stringify(result);
          io.emit('updateredo', socket.username, socket.topicId, resultStr);
        }
      };

      var getEvent = require('./handlers/getEvent.js');
      getEvent.validate(req, function (err) {
        if (err) return nextCb(err);
        getEvent.run(req, res, nextCb);
      });
    });

    socket.on('deleteimage', function (data) {
      console.log('deleteimage');

      var req = expressValidatorStub({
        params: {
          eventId: data.id
        }
      });

      var nextCb = function (err) {
        // TBD
      };

      var res = {
        send: function (result) {
          io.emit('updatepictureboard', socket.topicId);
        }
      };

      var deleteEvent = require('./handlers/deleteEvent.js');
      deleteEvent.validate(req, function (err) {
        if (err) return nextCb(err);
        deleteEvent.run(req, res, nextCb);
      });
    });

    socket.on('deletechat', function (data) {
      console.log('deletechat');

      var req = expressValidatorStub({
        params: {
          eventId: data.id
        }
      });

      var nextCb = function (err) {
        // TBD
      };

      var res = {
        send: function (result) {
          io.emit('deletedchat', socket.userId, socket.topicId, data.id, JSON.stringify(result, null));
        }
      };

      var deleteChat = require('./handlers/deleteChat.js');
      deleteChat.validate(req, function (err) {
        if (err) return nextCb(err);
        deleteChat.run(req, res, nextCb);
      });
    });

    socket.on('getreporttopics', function (sessionId, userID) {
      console.log('getreporttopics');

      if (sessionId == null || userID == null) return;

      var req = expressValidatorStub({
        params: {
          sessionId: sessionId
        }
      });

      var nextCb = function (err) {
        // TBD
      };

      var res = {
        send: function (result) {
          var resultStr = JSON.stringify(result);
          io.connected[socket.id].emit('showreportbox', resultStr);
        }
      };

      var getReportTopics = require('./handlers/getReportTopics.js');
      getReportTopics.validate(req, function (err) {
        if (err) return nextCb(err);
        getReportTopics.run(req, res, nextCb);
      });
    });

    socket.on('setusername', function (username) {
      console.log("setusername");
      if (username == null) return;
      socket.username = username;
    });

    socket.on('getparticipants', function (sessionId) {
      console.log("getparticipants");

      if (sessionId == null) return;

      var req = expressValidatorStub({
        params: {
          sessionId: sessionId
        }
      });

      var nextCb = function (err) {
        // TBD
      };

      var res = {
        send: function (result) {
          io.connected[socket.id].emit('participants', JSON.stringify(result, null));
        }
      };

      var getParticipants = require('./handlers/getParticipants.js');
      getParticipants.validate(req, function (err) {
        if (err) return nextCb(err);
        getParticipants.run(req, res, nextCb);
      });
    });

    socket.on('gettopics', function (sessionId) {
      console.log("gettopics");

      if (sessionId == null) return;

      var req = expressValidatorStub({
        params: {
          sessionId: sessionId
        }
      });

      var nextCb = function (err) {
        throw err;
      };

      var res = {
        send: function (result) {
          io.connected[socket.id].emit('topics', JSON.stringify(result, null));
        }
      };

      var getTopics = require('./handlers/getTopics.js');
      getTopics.validate(req, function (err) {
        if (err) return nextCb(err);
        getTopics.run(req, res, nextCb);
      });
    });

    socket.on('thumbs_up', function (eventId, row_id, topicId) {
      console.log("thumbs_up");

      if (eventId == null) return;

      var req = expressValidatorStub({
        params: {
          eventId: eventId,
          topicId: topicId,
          updating_userId: socket.userId
        }
      });

      var nextCb = function (err) {
        throw err;
      };

      var res = {
        send: function (result) {
          io.emit('updatethumbsup', eventId, result);
        }
      };

      var thumbsUp = require('./handlers/thumbsUp.js');
      thumbsUp.validate(req, function (err) {
        if (err) return nextCb(err);
        thumbsUp.run(req, res, nextCb);
      });
    });

    socket.on('getchats', function () {
      console.log("getchats");

      var req = expressValidatorStub({
        params: {
          topicId: socket.topicId
        }
      });

      var nextCb = function (err) {
        console.log(err);
        throw(err);
      };

      var res = {
        send: function (result) {
          io.connected[socket.id].emit('chats', JSON.stringify(result, null));
        }
      };

      var getChats = require('./handlers/getChats.js');
      getChats.validate(req, function (err) {
        if (err) return nextCb(err);
        getChats.run(req, res, nextCb);
      });
    });

    //	    socket.on('getTopic', function () {
    //		    var req = expressValidatorStub({
    //			    params: {
    //				    topicId: socket.topicId
    //			    }
    //		    });
    //
    //		    var nextCb = function (err) {
    //			    throw err;
    //		    };
    //
    //		    var res = {
    //			    send: function (result) {
    //				    io.emit('topic', JSON.stringify(result, null));
    //			    }
    //		    };
    //
    //		    var getTopic = require('./handlers/getTopic.js');
    //		    getTopic.validate(req, function (err) {
    //			    if (err) return nextCb(err);
    //			    getTopic.run(req, res, nextCb);
    //		    });
    //	    });

    socket.on('getobjects', function () {
      console.log("getobjects");


      var req = expressValidatorStub({
        params: {
          topicId: socket.topicId
        }
      });

      var nextCb = function (err) {
        throw err;
      };

      var res = {
        send: function (result) {
          io.connected[socket.id].emit('objects', JSON.stringify(result, null));
        }
      };

      var getObjects = require('./handlers/getReportData_Whiteboard.js');
      getObjects.validate(req, function (err) {
        if (err) return nextCb(err);
        getObjects.run(req, res, nextCb);
      });
    });

    socket.on('getreport', function (sessionId, userID) {
      console.log("getreport");


      var req = expressValidatorStub({
        params: {
          sessionId: sessionId
        }
      });

      var nextCb = function (err) {
        throw err;
      };

      var res = {
        send: function (result) {
          io.connected[socket.id].emit('savepdffile', JSON.stringify(result, null));
        }
      };

      var getReport = require('./handlers/getReport.js');
      getReport.validate(req, function (err) {
        if (err) return nextCb(err);
        getReport.run(req, res, nextCb);
      });
    });

    socket.on('getresources', function (sessionId, type, isfacilitator) {
      console.log("getresources");


      var req = expressValidatorStub({
        params: {
          topicId: socket.topicId,
          resourceType: type,
          userId: socket.userId
        }
      });

      var nextCb = function (err) {
        // TBD
      };

      var res = {
        send: function (result) {
          socket.emit('resources', JSON.stringify(result, null), type);
        }
      };

      var getResources = require('./handlers/getResources.js');
      getResources.validate(req, function (err) {
        if (err) return nextCb(err);
        getResources.run(req, res, nextCb);
      });
    });

    socket.on('shareresource', function (json) {
      console.log("shareresource");


      io.emit('sharedresource', socket.userId, socket.topicId, json);
      socketHelper.createCustomEvent(socket.topicId, socket.userId, "shareresource", JSON.stringify(json, null));
    });

    socket.on('deleteresource', function (id) {
      console.log("deleteresource");


      if (!id) return;

      var req = expressValidatorStub({
        params: {
          resource_id: id
        }
      });

      var nextCb = function (err) {
        // TBD
      };

      var res = {
        send: function (result) {
        }
      };

      var deleteResource = require('./handlers/deleteResource.js');
      deleteResource.validate(req, function (err) {
        if (err) return nextCb(err);
        deleteResource.run(req, res, nextCb);
      });
    });

    socket.on('deleteobject', function (uid) {
      console.log("deleteobject");


      var params = {
        uid: uid
      };

      var nextCb = function (err) {
        throw err;
      };

      var resCb = function (data) {
      };

      var deleteEvent = require('./handlers/deleteEvent.js');
      deleteEvent.execute(params, resCb, nextCb);
    });

    socket.on('restoreobject', function (uid, object) {
      console.log("restoreobject");


      if (uid == null) return;

      /* Let's see if we need it */
      /*
      var	sqlCmd = '\n' +
      'update\n' +
      '	events\n' +
      'set\n' +
      '	deleted = NULL\n' +
      'where\n' +
      '	uid = "' + uid + '"';


      db.query(sqlCmd, function(err, result, fields) {
      if (err) throw err;

      io.emit('updatecanvas', -1, socket.topicId, object);
    }); */
  });

  function resourceAppendedCallback(userId, json) {
    var foundUser = _.find(io.connected, function (client) {
      return client.userId == userId;
    });

    if (foundUser) {

      foundUser.emit('resourceappended', json);
    }
  }

  socket.on('addvideo', function (json) {
    console.log("addvideo");

    socketHelper.updateResources(socket.topicId, socket.userId, json, "video", resourceAppendedCallback);
  });

  socket.on('addvote', function (json) {

    socketHelper.updateResources(socket.topicId, socket.userId, json, "vote", resourceAppendedCallback);
  });

  socket.on('vote', function (json) {
    console.log("vote");

    socketHelper.createCustomEvent(socket.topicId, socket.userId, "vote", json);
  });

  socket.on('enqueryvote', function (voteID, isfacilitator) {
    console.log("enqueryvote");

    socketHelper.enqueryVote(socket, voteID, socket.topicId, socket.userId, isfacilitator);
  });

  socket.on('modifyvote', function (json) {
    console.log("modifyvote");

    var req = expressValidatorStub({
      params: {
        id: json.id,
        JSON: {
          title: json.title,
          question: json.question,
          style: json.style
        }
      }
    });

    var resCb = function (result) {
      if (!result.vote) return;
      var resultStr = JSON.stringify(result.vote);
      io.connected[socket.id].emit('showvoteedit', resultStr);
    };

    var nextCb = function (err) {
      // TBD
    };

    var res = { send: resCb };

    var updateResource = require('./handlers/updateResource.js');
    updateResource.validate(req, function (err) {
      if (err) return nextCb(err);
      updateResource.run(req, res, nextCb);
    });
  });

  socket.on('editvote', function (voteId) {
    console.log("editvote");

    var req = expressValidatorStub({
      params: {
        voteId: voteId
      }
    });

    var resCb = function (result) {
      if (!result.vote) return;
      var resultStr = JSON.stringify(result.vote);
      io.connected[socket.id].emit('showvoteedit', resultStr);
    };

    var nextCb = function (err) {
      // TBD
    };

    var res = { send: resCb };

    var getResource = require('./handlers/getResource.js');
    getResource.validate(req, function (err) {
      if (err) return nextCb(err);
      getResource.run(req, res, nextCb);
    });
  });

  function getToggleEvents(topicId, resCb, nextCb) {
    var req = expressValidatorStub({
      params: {
        topicId: topicId
      }
    });

    var res = { send: resCb };

    var getEventsForToggle = require('./handlers/getEventsForToggle.js');
    getEventsForToggle.validate(req, function (err) {
      if (err)
      return nextCb(err);

      getEventsForToggle.run(req, res, nextCb);
    });
  }

  function getToggleEventsFlag(topicId, resCb, nextCb) {
    getToggleEvents(topicId, function (result) {
      /*
      if (!result || !result.length)
      return resCb(false);

      if (result.length != 1)
      return resCb(false);

      if (result[0].event == null)
      return resCb(false);

      var jsonResult = JSON.parse(decodeURI(result[0].event), null);
      return resCb(jsonResult.content == "true");
      */

      var toggleOn = "true";	//	set up our default
      if (result.length == 1) {
        if (result[0].event != null) {

          if (typeof result[0].event != "undefined") {
            var json = JSON.parse(decodeURI(result[0].event), null);
            toggleOn = ((json.content == "true") ? "false" : "true");
          }
        }
      }
      return resCb(toggleOn);
    }, nextCb)
  }

  function getCollageEvents(topicId, resCb, nextCb) {
    var req = expressValidatorStub({
      params: {
        topicId: topicId
      }
    });

    var res = { send: resCb };

    var getEventsForCollage = require('./handlers/getEventsForCollage.js');
    getEventsForCollage.validate(req, function (err) {
      if (err) return nextCb(err);
      getEventsForCollage.run(req, res, nextCb);
    });
  }

  socket.on('updateconsole', function (json, topicId, consoleState, lastConsoleState) {
    console.log("updateconsole");


    if (typeof json == "undefined")
    return;

    //	set up some defaults
    if (typeof json.updateEvent == "undefined")
    json.updateEvent = true;	//make sure we call updateEvents()

    var CS_PICTUREBOARD = 4;	//check this against console.js

    switch (json.type) {
      case 'pictureboard':
      {
        switch (json.content) {
          //lets get the pariticipants images (if any)...
          //if case of 'false': turn the pinboard off
          case 'none':
          case 'true':
          getCollageEvents(topicId, function (result) {
            var resultAsString = JSON.stringify(result, null);
            if (json.content == "none")
              io.emit('updatedconsole', socket.topicId, consoleState, resultAsString);
            else
              io.connected[socket.id].emit('updatedconsole', socket.topicId, consoleState, resultAsString);
          });
          break;

          case 'toggle':
          {
            getToggleEventsFlag(topicId, function (toggleOn) {
              //toggle the picture board
              socketHelper.createCustomEvent(socket.topicId, socket.userId, "shareresource", JSON.stringify({
                type: 'pictureboard',
                content: toggleOn
              }, null));

              if (toggleOn)
              getCollageEvents(topicId, function (result) {
                io.emit('updatedconsole', socket.topicId, consoleState, JSON.stringify(result, null));
              })
              else {
                //turn the pinboard off
                if (consoleState & CS_PICTUREBOARD) consoleState -= CS_PICTUREBOARD;
                io.emit('updatedconsole', socket.topicId, consoleState, "{}");
              }
            });
          }
          break;
        }
      }
      break;
      default:
      {
        //before we do anything, lets see if we have a pictureboard
        getToggleEventsFlag(topicId, function (pinboardPresent) {
          //do we want to remove the pictureboard?
          if (!pinboardPresent) {
            var removePictureboard = false;
            switch (json.type) {
              case 'video':
              case 'audio':
              case 'vote':
              if ((consoleState & CS_PICTUREBOARD) != CS_PICTUREBOARD) consoleState = (consoleState + CS_PICTUREBOARD);
              break;
              default:
              if ((consoleState & CS_PICTUREBOARD) == CS_PICTUREBOARD) consoleState = (consoleState - CS_PICTUREBOARD);
              removePictureboard = true;
              break;
            }
          }

          //firstly we want to make sure our picture board is not showing...
          if (!pinboardPresent) {
            //OK, lets process the message now
            if (json.updateEvent && removePictureboard) {
              //turn the pinboard off
              socketHelper.createCustomEvent(socket.topicId, socket.userId, "shareresource", JSON.stringify({
                type: 'pictureboard',
                content: "false"
              }, null));
            }
          }

          if (json.updateEvent) {
            var processShareResource = true;
            if (typeof json.content != "undefined") {
              if (json.content == 'none') processShareResource = false;
            }

            if (processShareResource) {
              socketHelper.createCustomEvent(socket.topicId, socket.userId, "shareresource", JSON.stringify(json, null));
            }
          }

          json.userID = socket.userId; //make sure we know who the message came from

          //at this point, json.type could be anything other than 'pictureboard'
          if (json.updateEvent) {
            json.updateEvent = false; //make sure we dont do this again
            io.emit('updatedconsole', socket.topicId, consoleState, json);
          } else{
            io.connected[socket.id].emit('updatedconsole', socket.topicId, consoleState, json);
          }
        })
        break;
      }
    }
  });

  socket.on('settopicid', function (topicId, initialTopicSet, userId) {
    console.log("settopicid");

    if (userId != socket.userId) return;

    if (typeof initialTopicSet == "undefined") { initialTopicSet = true };

    //	set the topic within our nameList
    for (var ndx = 0, ln = nameList.length; ndx < ln; ndx++) {
      if (nameList[ndx].id == socket.userId) {
        nameList[ndx].topicId = topicId;
        break;
      }
    }

    socket.topicId = topicId;
    globalVars.topicId = topicId;

    io.connected[socket.id].emit('topicset', !initialTopicSet);

    if (typeof socket.userId != "undefined") {
      //	reply to the sender

      socketHelper.createCustomEvent(socket.topicId, socket.userId, "settopic");
    }

    var req = expressValidatorStub({
      params: {
        topicId: socket.topicId
      }
    });

    var nextCb = function (err) {
      throw err;
    };

    var res = {
      send: function (result) {
        io.emit("topicLoaded", JSON.stringify(result, null));
      }
    };

    var getTopic = require('./handlers/getTopic.js');
    getTopic.validate(req, function (err) {
      if (err) return nextCb(err);
      getTopic.run(req, res, nextCb);
    });
  });

  socket.on('setavatarcaption', function (userId, topicId, caption) {
    console.log("setavatarcaption");


    //	set the topic within our nameList
    for (var ndx = 0, ln = nameList.length; ndx < ln; ndx++) {
      if (nameList[ndx].id == userId) {
        nameList[ndx].topicId = topicId;
        nameList[ndx].caption = caption;
        break;
      }
    }
    io.emit("updateavatarcaption", userId, socket.sessionId, nameList);
  });

  socket.on('adduser', function (sessionId, userId, username) {
    console.log("adduser");


    //	we store the username in the socket session for this client
    socket.sessionId = sessionId;		//	really only used here, but lets set it anyway
    globalVars.userId = userId;
    socket.username = username;
    globalVars.username = username;

    // have we already added this user?
    if (userids[userId] == userId) {
      switch (conflict) {
        case "drop existing":
        //	disconnect the other socket as we should only have one user at a time...
        var keys = Object.keys(io.sockets);
        for (var ndxSocket = 0, nk = keys.length; ndxSocket < nk; ndxSocket++) {
          var currentSocket = io.sockets.sockets[keys[ndxSocket]];
          if (currentSocket.userId == userId) {
            currentSocket.disconnect();

            break;
          }
        }
        break;
        case "drop current":
          //	disconnect this socket as we should only have one user on at a time...
          io.connected[socket.id].emit('alreadyconnected');
          io.connected[socket.id].disconnect();

          return;
          break;
      }

    }

    socket.userId = userId;

    // add the client's username to the global list
    userids[userId] = userId;
    nameList.push({
      "id": userId,
      "name": username
    })

    //	update the list of users in chat, client-side
    //	this message is session specific, not topic specific

    io.emit('updateusers', socket.sessionId, socket.userId, nameList);
    socketHelper.createLog(socket.userId, "connect");
  });

  socket.on('updateemotions', function (userId, topicId, data) {
    console.log("updateemotions");

    io.emit('updatedemotions', userId, topicId, data);
  });

  socket.on('updatetag', function (json) {
    console.log("updatetag");


    var req = expressValidatorStub({
      params: {
        id: parseInt(json.id.replace(/\D/g, '')),
        topicId: socket.topicId,
        tag: json.value
      }
    });

    var resCb = function (result) {
      if (!result.fields) return;
      io.emit('updatedtag', result.fields.topicId, result.fields.id, result.fields.tag);
    };

    var nextCb = function (err) {
      // TBD
    };

    var res = { send: resCb };

    var updateEvent = require('./handlers/updateEvent.js');
    updateEvent.validate(req, function (err) {
      if (err) return nextCb(err);
      updateEvent.run(req, res, nextCb);
    });
  });

  socket.on('settmptitle', function (userId, topicId, title, text, formID) {
    console.log("settmptitle");

    var content = {
      title: title,
      text: text
    };

    var req = expressValidatorStub({
      params: {
        userId: userId,
        topicId: topicId,
        URL: "url",
        JSON: content
      }
    });

    var resCb = function (result) {
      if (!result) return;
      io.connected[socket.id].emit('submitform', formID);
    };

    var nextCb = function (err) {
      // TBD
    };

    var res = { send: resCb };

    var updateTmpTitle = require('./handlers/updateTmpTitle.js');
    updateTmpTitle.validate(req, function (err) {
      if (err) return nextCb(err);
      updateTmpTitle.run(req, res, nextCb);
    });
  });

  socket.on('getlastsharedresources', function (topicId) {
    console.log("getlastsharedresources");


    var req = expressValidatorStub({
      params: {
        topicId: topicId
      }
    });

    var resCb = function (result) {
      if (!result) return;
      var jsonData = JSON.stringify(result, null);
      io.connected[socket.id].emit('lastsharedresources', jsonData);
    };

    var nextCb = function (err) {
      throw err;
    };

    var res = { send: resCb };

    var getLastSharedResources = require('./handlers/getLastSharedResources.js');
    getLastSharedResources.validate(req, function (err) {
      if (err) return nextCb(err);
      getLastSharedResources.run(req, res, nextCb);
    });
  });

  socket.on('getbrandprojectinfo', function (sessionId) {
    console.log("getbrandprojectinfo");

    var req = expressValidatorStub({
      params: {
        sessionId: sessionId
      }
    });

    var resCb = function (result) {
      if (!result) return;
      var jsonData = JSON.stringify(result, null);
      io.connected[socket.id].emit('brandprojectinfo', jsonData);
    };

    var nextCb = function (err) {
      // TBD
    };

    var res = { send: resCb };

    var getBrandProjectInfo = require('./handlers/getBrandProjectInfo.js');
    getBrandProjectInfo.validate(req, function (err) {
      if (err) return nextCb(err);
      getBrandProjectInfo.run(req, res, nextCb);
    });
  });

  socket.on('getuserinfo', function (userId, sessionId, brandProjectId) {
    console.log("getuserinfo");

    var req = expressValidatorStub({
      params: {
        userId: userId,
        sessionId: sessionId,
        brand_project_id: brandProjectId,
      }
    });

    var resCb = function (result) {
      if (!result) return;
      var jsonData = JSON.stringify(result, null);
      io.connected[socket.id].emit('userinfo', jsonData);
    };

    var nextCb = function (err) {
      // TBD
    };

    var res = { send: resCb };

    var getUserLogin = require('./handlers/getUserLogin.js');
    getUserLogin.validate(req, function (err) {
      if (err) return nextCb(err);
      getUserLogin.run(req, res, nextCb);
    });
  });

  socket.on('disconnect', function () {
    console.log("disconnect");


    if (socket.userId == null) return;		//	got here by accident (it happens)...

    for (var ndx = 0, nl = nameList.length; ndx < nl; ndx++) {
      if (nameList[ndx].id == socket.userId) {
        nameList.splice(ndx, 1);
        break;
      }
    }

    delete userids[socket.userId];


    // update list of users in chat, client-side
    io.emit('updateusers', socket.sessionId, socket.userId, nameList);
    socketHelper.createLog(socket.userId, "disconnect");      // TBD: where it is defined?
  });

  socket.on('getavatarinfo', function (userId, sessionId) {
    console.log("getavatarinfo");


    var req = expressValidatorStub({
      params: {
        userId: userId,
        sessionId: sessionId
      }
    });

    var resCb = function (result) {
      if (!result) return;
      //io.emit('avatarinfo', config, result);
      io.connected[socket.id].emit('avatarinfo', result[0]);
    };

    var nextCb = function (err) {
      // TBD
    };

    var res = { send: resCb };

    var getAvatarInfo = require('./handlers/getAvatarInfo.js');
    getAvatarInfo.validate(req, function (err) {
      if (err) return nextCb(err);
      getAvatarInfo.run(req, res, nextCb);
    });
  });

  socket.on('setavatarinfo', function (userId, avatarInfo) {
    console.log("setavatarinfo");


    var req = expressValidatorStub({
      params: {
        //userId: userId,
        id: userId,
        //avatarInfo: avatarInfo
        avatar_info: avatarInfo
      }
    });

    var resCb = function () {
      var avatarinfoAsJSON = {
        userid: userId,
        avatarinfo: avatarInfo
      }

      //	we are only updating head, face, hair, top & accessories
      //	we are no updating the name tag, so no need for colour, name or gender
      //	one other interesting point, avatars are at a session level, not just a topic level
      io.emit('updateavatarinfo', socket.sessionId, socket.userId, avatarinfoAsJSON);
    };

    var nextCb = function (err) {
      // TBD
    };

    var res = { send: resCb };

    var updateUser = require('./handlers/updateUser.js');
    updateUser.validate(req, function (err) {
      if (err) return nextCb(err);
      updateUser.run(req, res, nextCb);
    });
  });

  socket.on('restart', function () {

    io.close();
    server.close();
  });

  socket.on('report', function (json) {

    var resCb = function (pdfLinks) {
      io.connected[socket.id].emit('savedreport', JSON.stringify(pdfLinks, null));
    };

    var nextCb = function (err) {
      if (err) throw err;
    };

    require('./handlers/reportHandlers/factory.js')(json, resCb, nextCb);
  });
});

return io;
};
