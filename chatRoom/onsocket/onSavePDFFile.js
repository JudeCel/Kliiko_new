var onSavePDFFile = function(result) {
	var dataAsJson = JSON.parse(result);

	//sort conversation content to correct sequence 
	//(mainly put reply content after the original content it reply to)
	var processedData = sortResult(dataAsJson);
	processedData = processEvent(processedData);

	var filteredData = filterResult(processedData);
	console.log('filterResult');
	console.log(filterResult);

	//window.reportbox.setReportValue(processedData);
	window.reportbox.setReportValue(filteredData);
	window.reportbox.toFront();
	window.reportbox.close();
};

var filterResult = function(processedData){
	var list = window.reportbox.getTopicList();

	var filteredData = [];
	for(var i=0; i<=list.length-1; i++){
		filteredData[i] = [];
	}

	for(var i=0; i<=processedData.length-1; i++){
		var ii = null;
		for(ii=0; ii<=list.length-1; ii++){
			if(processedData[i].topicId == list[ii].topicId)
				break;
		}

		var count = filteredData[ii].length;
		filteredData[ii][count]=processedData[i];
	}
	return filteredData;
}

var processEvent = function(processedData){
	 for(var ndx=0; ndx<processedData.length; ndx++){
		var chatEvent=decodeURI(processedData[ndx].event);
		processedData[ndx].event=JSON.parse(chatEvent);

		//Swap ' and " into strange characters for further transfer
		var string = processedData[ndx].event.object.input;
		string = string.replace(/'/g,"@#&");
		string = string.replace(/"/g,'&#@');
		processedData[ndx].event.object.input = string;
	}
	return processedData;
}
var generatePDF = function(sortedData,fileName,type){
	var doc = new jsPDF();
	doc.text(10,10, sortedData[0].topic_name);
	if(type==0){
		doc.text(10, 15, "[ Full Content from Conversation ]");
	}else if(type==1){
		doc.text(10, 15, "[ Only Star Content from Conversation ]");
	}


	var currentY = 30;
	var lineWidth = 10;
	var pageGap = 300;
	var normalX = 10;
	var ReplyX = 20

	for(var ndx=0; ndx<sortedData.length; ndx++){
		var chatEvent=decodeURI(sortedData[ndx].event);
		var eventAsJson=JSON.parse(chatEvent);

		if(sortedData[ndx].replyId != null){
			doc.text(ReplyX, currentY, sortedData[ndx].firstName+"  "+sortedData[ndx].lastName+"  "+eventAsJson.object.date);
			doc.text(ReplyX, currentY+lineWidth, eventAsJson.object.input);
		}else{
			doc.text(normalX, currentY, sortedData[ndx].firstName+"  "+sortedData[ndx].lastName+"  "+eventAsJson.object.date);
			doc.text(normalX, currentY+lineWidth, eventAsJson.object.input);
		}
		currentY += lineWidth*3;

		if(currentY+lineWidth*3 > pageGap){
			doc.addPage();
			currentY =20;
		}
	}


$.ajax({
   	type: 'POST',
    url: window.URL_PATH + window.SERVER_PATH + "PDFgenerator.php",
    error: function(e) {
       console.log(e.message);
    },
    success: function(output) {
  		window.open(output);
 	}
});

/*	var browser = getBrowser();
	alert("in generating "+browser);
	switch(browser){
	case "chrome":
		doc.output("datauri");
		break;
	case "firefox":
		doc.save(fileName);
		break;
	case "safari":
		doc.output("datauri");
		break;
	case "ie":
		break;
	}*/
//	doc.save(fileName);

//ar pdfAsDataURI = doc.output('datauri');
//window.open("data:application/pdf;base64, " + pdfAsDataURI);
	//doc.output("datauri");
//var res = doc.output("datauri");


//	alert("file saved");
};

var sortResult = function(dataAsJson){
	var transData = null;
	for(var ndx=1; ndx<dataAsJson.length; ndx++){
		for(var nndx=dataAsJson.length-1; nndx>=ndx; nndx--){
			if(dataAsJson[nndx].replyId!=null && dataAsJson[nndx].replyId < dataAsJson[nndx-1].id){
				if(dataAsJson[nndx-1].replyId==null || dataAsJson[nndx].replyId <dataAsJson[nndx-1].replyId){
					transData = dataAsJson[nndx];
					dataAsJson[nndx] = dataAsJson[nndx-1];
					dataAsJson[nndx-1] = transData;
				}
			}
		}
	}
	return dataAsJson;
};
	