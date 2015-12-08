/*
	ie-set_timeout.js
	-----------------
	Override the setTimeout function on Internet Explorer, which
	doesn't accept function parameters.
 
	Documentation: https://developer.mozilla.org/en/DOM/window.setTimeout

	Copyright (c) 2010 Ernesto Mendez (der-design.com)
	Dual licensed under the MIT and GPL licenses:
	http://www.opensource.org/licenses/mit-license.php
	http://www.gnu.org/licenses/gpl.html

	Version 1.0.1
		Added missing return statement, which failed to return a timeout ID

		Version 1.0.0
			Initial Release	
*/
(function() {
	/*
		Returns the version of Internet Explorer or a -1, if using another browser
		http://msdn.microsoft.com/en-us/library/ms537509(v=vs.85).aspx 
	*/
	function getInternetExplorerVersion() {
		var rv = -1; // Return value assumes failure.
		if (navigator.appName == 'Microsoft Internet Explorer') {
			var ua = navigator.userAgent;
			var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null) {
				rv = parseFloat( RegExp.$1 ); 
			}
		}
		
		return rv;
	}
	
	/*
		Detect if any version of Internet Explorer is used,
		and override the window.setTimeout function with the new one, which
		provides support for function arguments.
	*/
	if ( getInternetExplorerVersion() != -1 ) {
		var old_setTimeout = window.setTimeout;
		window.setTimeout = function(callback, timeout) {
			var args = [];
			for (var i=0; i < arguments.length; i++) {
				args.push(arguments[i]);
			} // Convert args to array
			
			args = args.slice(2);	//	drop the first 2 arguments

			var f = function() {
				callback.apply(null, args);
			}	// Makes 'this' to be mapped to DOMWindow
			
			return old_setTimeout(f, timeout); // Return timeout ID
		}
	}
})();