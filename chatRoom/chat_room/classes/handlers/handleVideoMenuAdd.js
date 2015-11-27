var videoMenuAddHandler = function() {
	var html =	'<div style="position:relative; left:0px; top:0px; width:0px; height: 0px;">' +
				'	<div style="position:absolute; left:80px; top:180px; width:200px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
				'		<input id="IDUploadVideoTitle" placeholder="Enter a title here" title="Enter a title here" onkeypress="return window.handleDashboardTitleKeyPress(event, this);" style="font-size: 24px;">' +
				'	</div>' +
				'	<div style="position:absolute; left: 30px; top:220px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
				'		<textarea name="taPasteYouTube" id="taPasteYouTube" rows="8" cols="80" style="resize: none;"></textarea>' +
				'	</div>' +
				'</div>';
			
	window.dashboard.setVideoHTML(html);
	window.dashboard.toFront();
	window.dashboard.close();
}