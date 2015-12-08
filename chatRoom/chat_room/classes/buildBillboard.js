var build = namespace('sf.ifs.Build');

build.Billboard = function() {
	//if (isEmpty(window.billboard)) return;
	window.socket.emit('getTopic');
}

build.Billboard.prototype.processBillboard = function(data) {
	if (isEmpty(data)) return;

	data = JSON.parse(data);

	if(topicID == data.id){
		var billboardText = document.getElementById("billboardText");
		billboardText.innerHTML = data.description;

		CKEDITOR.instances['billboardEditor'].setData(data.description);
	}
}
