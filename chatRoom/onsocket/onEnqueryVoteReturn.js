var onEnqueryVoteReturn = function(isVoted, result) {
	if (isVoted) {
		thisMain.handleConsoleVoteResult(result);
	} else {
		thisMain.handleConsoleVoteMore();
	}
};