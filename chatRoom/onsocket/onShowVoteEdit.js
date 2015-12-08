var onShowVoteEdit = function(result) {
	var dataAsJson = JSON.parse(result);
	if(dataAsJson.length>0){
		var voteEvent = decodeURI(dataAsJson[0].JSON);
		var jsonEvent = JSON.parse(voteEvent);

		var edit = document.getElementById("IDEditVote");
		edit.value = dataAsJson[0].id;

		var titleArea = document.getElementById("IDEditVoteTitle");
		titleArea.value = jsonEvent.title;

		var questionArea = document.getElementById("IDEditVoteQuestion");
		questionArea.value = jsonEvent.question;

		var styleArea = document.getElementById("IDEditVoteStyle");
		switch(jsonEvent.style){
			case "YesNoUnsure":
				styleArea.innerHTML = "Yes / No / Unsure";	
				styleArea.value = jsonEvent.style;
			break;
			case "StarRating":
				styleArea.innerHTML = "Star Rating (out of 5)";	
				styleArea.value = jsonEvent.style;
			break;	
		}
	}
};