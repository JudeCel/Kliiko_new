var onResources = function(data, type) {
	//	make sure the requestor processes this
	switch(type) {
		case "image": {
			var imageMenuJSON = {
				title:				"Images",
				x:	 				200,
				y:					100,
				width:				600,
				height:				400,
				radius:				10,
				thisMain:			thisMain,		//	pointer to the "this" structure in topic.html
				paper:				paperDashboard,		//	pointer to the canvas we are drawing on
				data:				data
			}

			if (isEmpty(thisMain.imageMenu)) {
				thisMain.imageMenu = new sf.ifs.View.ImageMenu(imageMenuJSON);
				thisMain.imageMenu.draw();
				if (thisMain.videoMenu != null) {
					thisMain.videoMenu.hide();
				}
				if (thisMain.audioMenu != null) {
					thisMain.audioMenu.hide();
				}
			} else {
				thisMain.imageMenu.hide();
			}
		}
		break;
		
		case "video": {
			var videoMenuJSON = {
				title:				"Videos",
				x:	 				200,
				y:					100,
				width:				600,
				height:				400,
				radius:				10,
				thisMain:			thisMain,		//	pointer to the "this" structure in topic.html
				paper:				paperDashboard,		//	pointer to the canvas we are drawing on
				data:				data
			}

			if (isEmpty(thisMain.videoMenu)) {
				thisMain.videoMenu = new sf.ifs.View.VideoMenu(videoMenuJSON);
				thisMain.videoMenu.draw();
				if (thisMain.imageMenu != null) {
					thisMain.imageMenu.hide();
				}
				if (thisMain.audioMenu != null) {
					thisMain.audioMenu.hide();
				}
			} else {
				thisMain.videoMenu.hide();
			}
		}
		break;
		
		case "audio": {
			var audioMenuJSON = {
				title:				"Sounds",
				x:	 				200,
				y:					100,
				width:				600,
				height:				400,
				radius:				10,
				thisMain:			thisMain,		//	pointer to the "this" structure in topic.html
				paper:				paperDashboard,		//	pointer to the canvas we are drawing on
				data:				data
			}

			if (isEmpty(thisMain.audioMenu)) {
				thisMain.audioMenu = new sf.ifs.View.AudioMenu(audioMenuJSON);
				thisMain.audioMenu.draw();
				if (thisMain.imageMenu != null) {
					thisMain.imageMenu.hide();
				}
				if (thisMain.videoMenu != null) {
					thisMain.videoMenu.hide();
				}
			} else {
				thisMain.audioMenu.hide();
			}
		}
		break;

		case "vote": {
			var voteMenuJSON = {
				title:				"Voting Forms",
				x:	 				200,
				y:					100,
				width:				600,
				height:				400,
				radius:				10,
				thisMain:			thisMain,		//	pointer to the "this" structure in topic.html
				paper:				paperDashboard,		//	pointer to the canvas we are drawing on
				data:				data
			}

			if (isEmpty(thisMain.voteMenu)) {
				thisMain.voteMenu = new sf.ifs.View.VoteMenu(voteMenuJSON);
				thisMain.voteMenu.draw();
			} else {
				thisMain.voteMenu.hide();
			}
		}
		break;
	}
};
