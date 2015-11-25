function config(configDomain, configPort, configMode) {
	//	OK, we have our connection to the server
	var socket = null;
	var role = getUrlVar("r");

	switch(role) {
		case "f":
		case "c":
			role = "facilitator";
		break;
		case "p":
			role = "participants";
		break;
		case "o":
			role = "observers";
		break;
		case "g":
			role = "global_administrator";
		break;
	}

	console.log("role = " + role);

	function readConfig(configDomain, configPort, configMode) {
		var socketConfig = io.connect(configDomain + ":" + configPort, {
			'reconnect': true,
			'reconnection delay': 500,
			'max reconnection attempts': 10
		});

		function addRowToTable(user_id, data) {
			var table = document.getElementById("tableResults");
			var row = table.insertRow(1);
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);
			var cell3 = row.insertCell(2);

			cell1.className = "span3";
			cell2.className = "span3";
			cell3.className = "span6";

			var d = new Date();
			var curr_date = d.getDate();
			var curr_month = d.getMonth() + 1; //Months are zero based
			var curr_year = d.getFullYear();
			var curr_milliseconds = d.getMilliseconds();
			var curr_seconds = d.getSeconds();
			var curr_minutes = d.getMinutes();
			var curr_hours = d.getHours();

			var formattedDate = curr_year + "/" + curr_month + "/" + curr_date + " " + curr_hours + ":" + curr_minutes + ":" + curr_seconds + "::" + curr_milliseconds;

			cell1.innerHTML = formattedDate;
			cell2.innerHTML = user_id;
			cell3.innerHTML = data;
		}

		socketConfig.on('help_config', function(help) {
			//	lets process config
			if (isEmpty(help)) return;
			if (isEmpty(help.menus)) return;

			//	defaults
			if (isEmpty(help.heading)) help.heading = "IFS Help";

			var div = document.getElementById("helpMain");
			var html = "<div class=\"container\">";
			
			//	A
			html += "<div class=\"navbar\">";
			html += "<a class=\"navbar-brand\" href=\"#\">" + help.heading + "</a>";
			html += "</div>";	//	navbar

			html += "<div class=\"container bs-docs-container\">" 
			html += "<div class=\"row\">" 
			html += "<div class=\"col col-lg-4 sidebar-container\">" 
			html += "<div class=\"bs-sidebar affix-top\">" 
			html += "<ul class=\"nav bs-sidenav\">" 
			for (var ndxMenu = 0, lhm = help.menus.length; ndxMenu < lhm; ndxMenu++) {
				var found = true;
				if (!isEmpty(help.menus[ndxMenu].visible)) {
					found = $.inArray(role, help.menus[ndxMenu].visible) > -1;
				}
				if (found) {			
					if (!isEmpty(help.menus[ndxMenu].menu)) {
						if (ndxMenu === 0) {
							html += "<li class=\"active\">";
						} else {
							html += "<li class=\"\">";
						}
						html += "<a href=\"#" + help.menus[ndxMenu].menu.toCamelCase() + "\">" + help.menus[ndxMenu].menu + "</a>";
						html += "<ul class=\"nav\">";

						if (isEmpty(help.menus[ndxMenu].items)) continue;

						for (var ndxMenuItem = 0, lhmi = help.menus[ndxMenu].items.length; ndxMenuItem < lhmi; ndxMenuItem++) {
							if (!isEmpty(help.menus[ndxMenu].items[ndxMenuItem].name)) {
								html += "<li class=\"\"><a href=\"#\" onclick=\"updateHelpContent(" + ndxMenu + ", " + ndxMenuItem + ")\">" + help.menus[ndxMenu].items[ndxMenuItem].name + "</a></li>"
							}
						}
						html += "</ul>";
						html += "</li>"	//	
					}
				}
			}

			html += "</ul>";	//	nav bs-sidenav
			html += "</div>";	//	bs-sidebar affix-top
			html += "</div>";	//	col-lg-3
			html += "<div class=\"col col-lg-8 content-container\">";
			html += "<div id=\"helpContent\">";
			html += "</div>";	//	id="help-content"
			html += "</div>";	//	col-lg-9
			html += "</div>";	//	row
			html += "</div>";	//	container
			html += "</div>";	//	container

			div.innerHTML = html;

    		$("li").click(function(e) {
		        $('li').removeClass('active');

		        var $this = $(this);
		        if (!$this.hasClass('active')) {
		            $this.addClass('active');
		        }
		    });
	
			window.help = help;
		});

		socketConfig.emit("help_get_help_config");

	}

	readConfig(configDomain, configPort, configMode);
}
