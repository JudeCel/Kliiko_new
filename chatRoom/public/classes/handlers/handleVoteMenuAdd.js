var voteMenuAddHandler = function() {
	var html =	'<div style="position:relative; left:0px; top:0px; width:0px; height: 0px;">' +
				'	<div style="position:absolute; left:160px; top:180px; width:200px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
				//'		<input id="IDUploadVoteTitle" placeholder="Enter a title here" title="Enter a title here" onkeypress="return window.handleDashboardTitleKeyPress(event, this);" style="font-size: 24px;">' +
				'		<input id="IDUploadVoteTitle" placeholder="Enter a title here" title="Enter a title here" maxlength="20" style="font-size: 24px;">' +
				'	</div>' +
				'	<div style="position:absolute; left: 160px; top:220px; width:540px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
				//'		<input id="IDUploadVoteQuestion" placeholder="Enter a question here" title="Enter a question here" onkeypress="return window.handleDashboardQuestionKeyPress(event, this);" style="font-size: 18px;">' +
				'		<input id="IDUploadVoteQuestion" placeholder="Enter a question here" title="Enter a question here"  maxlength="40" style="font-size: 18px;">' +
				'	</div>' +
				'</div>';


	window.dashboard.setVoteHTML(html);
	window.dashboard.toFront();
	window.dashboard.close();
}
