var voteMenuEditHandler = function(voteID) {	
	var html =	'<div id="IDEditVote" style="position:relative; left:0px; top:0px; width:0px; height: 0px;">' +
				'	<div style="position:absolute; left:160px; top:180px; width:540px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
				'		<input id="IDEditVoteTitle" title="Edit title here" style="font-size: 24px;">' +
				'	</div>' +
				'	<div style="position:absolute; left: 160px; top:220px; width:540px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
				'		<input id="IDEditVoteQuestion" title="Edit question here" style="font-size: 18px;">' +
				'	</div>' +
				'	<div style="position:absolute; left: 160px; top:255px; width:540px; height: 40px; filter:alpha(opacity=1.0); opacity:1.0; overflow:hidden; cursor:hand;">' +
				'   	<label id="IDEditVoteStyle" style="font-size: 18px;"></label>' +
				'	</div>'+
				'</div>';


	window.dashboard.setVoteEditHTML(html);
	window.dashboard.toFront();
	window.dashboard.close();

	socket.emit('editvote', voteID);
}
