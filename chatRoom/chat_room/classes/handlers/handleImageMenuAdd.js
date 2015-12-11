var imageMenuAddHandler = function() {
	var html =	'<form id="formUploadImage" method="post" action="/uploadimage" enctype="multipart/form-data" target="iFrameUploadImage">' +
				'	<div style="position:relative; left:0px; top:0px; width:0px; height: 0px;">' +
				'		<div style="position:absolute; left:80px; top:300px; width:200px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
				//'			<input id="IDUploadImageTitle" placeholder="Enter a title here" title="Enter a title here" onkeypress="return window.handleDashboardTitleKeyPress(event, this);" style="font-size: 24px;">' +
				'			<input id="IDUploadImageTitle" placeholder="Enter a title here" title="Enter a title here"  maxlength="20" style="font-size: 24px;">' +
				'		</div>' +
				'		<div style="position:absolute; left:80px; top:360px; width:200px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand; visibility: hidden; display: none;">' +
				'			<input id="IDUploadImageText" style="font-size: 24px;">' +
				'		</div>' +
				'		<span style="position:absolute; left:300px; top:300px; width:320px; height: 40px;  filter:alpha(opacity=0.0); opacity:0.0; overflow:hidden; cursor:hand;">' +
				'			<input type="file" id="IDUploadImageHidden" name="uploadedfile" onchange="window.checkImageFileExtension(this, \'formUploadImage\', \'IDUploadImageTitle\', \'IDUploadImageText\')" style="font-size: 50px;">' +
				'		</span>' +
				'	</div>' +
				'	<iframe id="iFrameUploadImage" name="iFrameUploadImage" src="/chat/iFrame" style="visibility: hidden; display: none;">' +
				'	</iframe>' +
				'</form>';

	var json = {
		formID: "formUploadImage",
		titleID: "IDUploadImageTitle",
		textID: "IDUploadImageText"				//	used to pass the filename through
	}

	window.dashboard.toFront();
	window.dashboard.setBrowseForImageResource(html, json);
	window.dashboard.close();
}
