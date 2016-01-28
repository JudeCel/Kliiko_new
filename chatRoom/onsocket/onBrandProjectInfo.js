var onBrandprojectinfo = function (data) {
    //	make sure only the requestor gets the username...
    var json = [];

    if (!isEmpty(data)) {
        json = JSON.parse(data);
    }

    if (json.length == 0) {
        var dashboard = window.getDashboard();
        dashboard.showMessage({
            message: {
                text: "I am unable to find which Brand Project you belong too.\nMaybe the Session ID is not set correctly\n \nPlease contact your Facilitator.",
                attr: {
                    'font-size': 24,
                    fill: "white"
                }
            },
            dismiss: {
            },
            showClose: false,
            zIndex: 9
        }, function (value) {
            window.getDashboard().toBack();		//	time to hide the dashboard
        });
    } else if (json.length > 1) {
        dashboard.showMessage({
            message: {
                text: "There might be more than one Brand Project\nset up for this Session\n \nPlease contact your Facilitator.",        // TBD: really?! wtf
                attr: {
                    'font-size': 24,
                    fill: "white"
                }
            },
            dismiss: {
            },
            showClose: false,
            zIndex: 9
        }, function (value) {
            window.getDashboard().toBack();		//	time to hide the dashboard
        });
    } else {
        window.brandProjectInfo = json;

        var IFSLogo = null;
        if (window.brandProjectInfo['enable_chatroom_logo'] > 0 && window.brandProjectInfo['chatroom_logo_url'] != null) {//enabled
            var temp_index = window.URL_PATH.indexOf('admin/');
            if (temp_index != -1) {
                var imgURL = window.URL_PATH.substring(0, temp_index);
            } else {
                temp_index = window.URL_PATH.indexOf('chat_room/');
                if (temp_index != -1) {
                    var imgURL = window.URL_PATH.substring(0, temp_index);
                } else {
                    var imgURL = window.URL_PATH;
                }
            }

            var orgURL = escape(window.brandProjectInfo['chatroom_logo_url']);
            temp_index = orgURL.indexOf('upload');
            if (temp_index != -1) {
                imgURL += 'admin/' + orgURL.substring(temp_index);
            } else {
                imgURL += 'admin/' + orgURL;
            }

            var logoImg = new Image();
            logoImg.src = imgURL;

            var width = logoImg.width;
            var height = logoImg.height;

            $('#logo-div').prepend('<img src=' + imgURL + ' />')
        } else {
            imgURL = "/chat_room/images/logoDefaultInsiderfocus.jpg";
                $('#logo-div').prepend('<img src=' + imgURL + ' />')
        }
        socket.emit('getuserinfo', window.userID, window.sessionId, window.brandProjectInfo.id);
        socket.emit('get_offline_transactions', window.sessionId, window.userID);
    }
};