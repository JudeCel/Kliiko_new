var audioMenuAddHandler = function() {
	var html =	'<form id="formUploadAudio" method="post" action="/uploadaudio" enctype="multipart/form-data" target="iFrameUploadAudio">' +
				'	<div style="position:relative; left:0px; top:0px; width:0px; height: 0px;">' +
				'		<div style="position:absolute; left:80px; top:300px; width:200px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
				//'			<input id="IDUploadAudioTitle" placeholder="Enter a title here" title="Enter a title here" onkeypress="return window.handleDashboardTitleKeyPress(event, this);" style="font-size: 24px;">' +
				'			<input id="IDUploadAudioTitle" placeholder="Enter a title here" title="Enter a title here"  maxlength="20" style="font-size: 24px;">' +
				'		</div>' +
				'		<div style="position:absolute; left:80px; top:360px; width:200px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand; visibility: hidden; display: none;">' +
				'			<input id="IDUploadAudioText" style="font-size: 24px;">' +
				'		</div>' +
				'		<span style="position:absolute; left:300px; top:300px; width:320px; height: 40px;  filter:alpha(opacity=0.0); opacity:0.0; overflow:hidden; cursor:hand;">' +
				'			<input type="file" id="IDUploadAudioHidden" name="uploadedfile" onchange="window.checkAudioFileExtension(this, \'formUploadAudio\', \'IDUploadAudioTitle\', \'IDUploadAudioText\')" style="font-size: 50px;">' +
				'		</span>' +
				'	</div>' +
				'	<iframe id="iFrameUploadAudio" name="iFrameUploadAudio" src="' + window.URL_PATH + window.SERVER_PATH + 'html/iFrame.html" style="visibility: hidden; display: none;">' +
				'	</iframe>' +
				'</form>';

	var json = {
		formID: "formUploadAudio",
		titleID: "IDUploadAudioTitle",
		textID: "IDUploadAudioText"				//	used to pass the filename through
	}			

	window.dashboard.toFront();
	window.dashboard.setBrowseForAudioResource(html, json);
	window.dashboard.close();
}
