var onResourceAppended = function(json){

    window.dashboard.toBack();

    switch (json.type) {

        case 'vote':
        case 'video': {
            socket.emit('getresources', window.sessionID, json.type, true);
        }
            break;


    }

};
