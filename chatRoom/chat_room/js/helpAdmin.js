var helpAdminApp = angular.module('helpAdminApp', []);

helpAdminApp.factory('Data', function() {
	//	todo: load this file
	return {
		"heading": "IFS Help v1.0",
		"menus": [{
			"menu": "Whiteboard",
			"visible": ["facilitator", "observers", "participants"],
			"items": [{
				"name": "What is the Whiteboard for?",
				"type": "html",
				"content": "<p>The <font color=\"red\">Whiteboard</font> is your <b>area</b> to draw and write your ideas.<br/>There are various <u>tools</u> you can use, including<ol><li>Scribble</li><li>Lines</li><li>Box</li><li>Circle</li><li>Arrows</li></ol></p>"
			}, {
				"name": "Expanding the Whiteboard",
				"type": "video",
				"content": "<iframe width=\"560\" height=\"315\" src=\"//www.youtube.com/embed/Uw8N-uNsvkw\" frameborder=\"0\" allowfullscreen></iframe>"
			}, {
				"name": "Drawing on the Whiteboard",
				"type": "pdf",
				"content": "Whiteboard_One"
			}]
		}, {
			"menu": "Set up Voting",
			"visible": ["facilitator"],
			"items": [{
				"name": "How do I set up a Question Vote?",
				"type": "website",
				"content": "http://www.apple.com"
			}, {
				"name": "How do I set up a Star Vote?",
				"type": "video",
				"content": "<iframe width=\"420\" height=\"315\" src=\"//www.youtube.com/embed/zC0jStpj6lU\" frameborder=\"0\" allowfullscreen></iframe>"
			}]
		}]
	};
})

function HelpAdminCtrl($scope, Data) {
	$scope.data = Data;
}