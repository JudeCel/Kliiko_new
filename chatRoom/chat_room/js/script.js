/**
* Author: Heinrich van der Berg - CouchCreative
* Section: Green Room
**/

/* -- Setup Video Player -- */

(function($) {
	var video_player = $('#video_player'),
			video_container = video_player.find('#player_container'),
			videos = video_container.find('a.video_btn'),
			video_data = '',
			flash = false,
			player = null,
			play = null,
			current_time = 0,
			play_check = null;

	videos.hide();

	$.fn.createPlayer = function(only_link) {
		var self = $(this),
			url = self.attr('href'),
			clean_url_id = find_video_id(url);

		if (clean_url_id) {
			var present_video = video_container.find('object, #ytapiplayer'),
				template = '<div id="ytapiplayer" class="player">You need Flash player 8+ and JavaScript enabled to view this video.</div>',
				flashvars = 'video_id=' + clean_url_id + '&playerapiid=' + clean_url_id;

			/* Remove video if exists */
			if (present_video.length) {
				present_video.remove();
				player = null;
			}

			video_container.prepend(template); //add video template	

			/* Detect if flash is present */
			if (swfobject.hasFlashPlayerVersion("8.0.0")) {
				flash = true;
			}

			/* If not only changing link */
			if (!only_link && flash) {
				/* Set controls appened to the control container */
				var control_container = $('<div id="control" />');
				control_container.append('<a href="#" id="play" class="control"><span>Play</span></a>').append('<a href="#" id="pause" class="control"><span>Pause</span></a>').append('<a href="#" id="volume" class="control"><span>Volume</span></a>');
				
				var container = document.getElementById('video_player');
					
				//check if full screen is supported
				var full_screen = false;
				if (container.requestFullscreen || container.mozRequestFullScreen || container.webkitRequestFullscreen) {
					full_screen = true;
				}
				
				//If full screen add full screen button
				if (full_screen) control_container.append('<a href="#" id="full" class="control"><span>Full</span></a>');				
				
				control_container.find('.control').wrapAll('<div class="inner" />');

				/* Set progressBar appended to the control container */
				var progress = $('<div id="progress" />');
				progress.append('<div id="elapsed" />');
			
				/* Append the created controls */
				video_container.append(progress).append(control_container);		
			}

			if (flash) {
				/* Create the interactivty */
				set_control_interactivity(clean_url_id, only_link);
			}	

			embed_video(flashvars, clean_url_id);
			
			organise_player(self.attr('id'), only_link);
		}

	}

	function find_video_id(url) {
		/* Find video_id */
		try{
			/* Find youtube id */
			var url_id = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/)[7];

			/* Strip id to use in video player */
			var clean_url_id = url_id.replace(/[^a-z0-9-]/ig,'');

			return clean_url_id;
		} catch(e) {
			console.log('Parsing Not Working');
			return false;
		}
	}

	function embed_video(flashvars, id) {
		/* embed video */
		var params = { allowScriptAccess: "always", allowFullScreen: "true", modestbranding: 1, wmode: "transparent", flashvars: flashvars },
				atts = { id: id },
				embed_video_url = "http://www.youtube.com/apiplayer?enablejsapi=1&version=3",
				object_container = $("#ytapiplayer"),
				template_val = '<object width="{{width}}" height="{{height}}"><param name="movie" value="http://www.youtube.com/v/{{video_id}}?fs=1&amp;hl=en_US"></param><param name="allowFullScreen" value="true"></param><param name="wmode" value="transparent"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/{{video_id}}?fs=1&amp;hl=en_US" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="{{width}}" height="{{height}}"></embed></object>';

		if (flash) {
			swfobject.embedSWF(embed_video_url, "ytapiplayer", "472", "324", "8", null, null, params, atts);
		} else {
			var replacements = {
				width: 210,
				height: 270,
				video_id: id
			};

			var template = Handlebars.compile(template_val);
			object_container.html(template(replacements));
		}
	}

	/**
	* Set video as active reorganise
	**/
	function organise_player(id, only_link) {
		var video_link = $('#' + id),
				span = video_player.find('.span12'),
				row = video_player.find('>.row-fluid');

		/* Set as active links */
		video_link.addClass('active');

		if (span.length && videos.length > 1 && !only_link) {
			var video_links = videos;
			videos.remove();

			row.append('<div class="links"></div');
			var links = row.find('.links');							
			
			/* Change spans */
			span.removeClass('span12').addClass('span8', 400);
			links.addClass('span4', 400).queue(function() {
				video_links.removeClass('span3').addClass('video_set');
				$(this).append(video_links).find('.video_set').show(100);

				$(this).dequeue();
			});
		} else if (videos.length == 1) {
			video_link.remove(); //remove link if only one
		}
	}

	/**
	* Get video data from youtube api
	**/
	function get_video_data(id) {
		var details = {
			url: 'http://gdata.youtube.com/feeds/api/videos/' + id + '?v=2&alt=jsonc',
			dataType: 'jsonp'
		};

		return details;
	}

	/* Check if the player has been activated */
	function video_started() {
		if ($.isFunction(player.getCurrentTime)) {
			var new_time = player.getCurrentTime();

			/* Compare time */
			if (new_time != current_time) {
				clearInterval(play_check);

				if (play.hasClass('initial')) {
					play.addClass('manual').trigger('click');
				}							
			}
		}
	}

	/* Set control interactivity */
	function set_control_interactivity(id, only_link) {
		var control = video_container.find('#control'),
				pause = control.find('#pause'),
				volume = control.find('#volume'),
				progress = video_container.find('#progress'),
				elapsed = progress.find('#elapsed'),
				progressCheck = null,
				duration = null,
				ratio = null,
				green_room = $('body#greenroom'),
				full = control.find('#full');

		play = control.find('#play');

		control.find('.control').attr('class', 'control').off('click').removeClass('isPlaying'); //reset classes
		clearInterval(progressCheck);

		$.when($.ajax(get_video_data(id))).done(function(data) {
			var player_object = video_container.find('object'),
					player_id = player_object.attr('id');

			if (!data.data) {
				video_container.hide();
				return false;
			}

			player = document.getElementById(player_id);	

			video_data = data.data;

			duration = video_data.duration;

			/* Play if video is manually activated */
			if (only_link) {
				play.trigger('click');
			} else {
				play.addClass('initial');
			}

			play_check = setInterval(video_started, 500);
			
			full.on('click', function() {
				var container = document.getElementById('video_player'),
						self = $(this);
					
				if (!video_player.hasClass('full')) {					
					if (container.requestFullscreen) {
						container.requestFullscreen();
					} else if (container.mozRequestFullScreen) {
						container.mozRequestFullScreen();
					} else if (container.webkitRequestFullscreen) {
						container.webkitRequestFullscreen();
					}					
				} else {
					if (container.cancelFullscreen) {
						container.cancelFullscreen();
					} else if (document.mozCancelFullScreen) {
						console.log('cancel');
						document.mozCancelFullScreen();
					} else if (document.webkitCancelFullScreen) {
						document.webkitCancelFullScreen();
					}			
				}
				
				return false;
			});
			
			$(document).on('webkitfullscreenchange fullscreenchange mozfullscreenchange', function() {
				if (!video_player.hasClass('full')) {
					video_player.addClass('full');
					full.addClass('active');
								
					$(player).height(screen.height - 80);
				} else {
					video_player.removeClass('full');
					$(player).removeAttr('style');
					full.removeClass('active');
				}
			});

			/* Make clickable progress bar */
			progress.on('click', function(e) {
				ratio = (e.pageX - progress.offset().left) / progress.outerWidth();

				play.removeClass('isPlaying').addClass('forward').trigger('click');	      

	      return false;
			});

			play.on('click', function() {
				var self = $(this);				

				/* If already playing */
				if (self.hasClass('isPlaying') && !self.hasClass('initial')) {
					pause.trigger('click');
				} else {
					self.removeClass('initial');

					/* Not playing yet */
					self.addClass('isPlaying');

					/* If was paused, reset graphics */
					if (pause.hasClass('active')) {
						pause.removeClass('active');
					}

					/* Go forward */
					if (self.hasClass('forward')) {
						self.removeClass('forward');

						/* Determine position of elapsed */
						elapsed.width(ratio * 100 + '%');
	      		player.seekTo(Math.round(duration * ratio), true);
					}
					
					//Check if the video was manually started by clicking on the big red button
					if (!self.hasClass('manual')) {
						player.playVideo(); //play video						
					} else {
						self.removeClass('manual');
					}

					progressCheck = window.setInterval(function() {
						var current_time = player.getCurrentTime()
								elapsed_time = (( (current_time / duration) * 100) + '%' );

						elapsed.width(elapsed_time);
					}, 1000);
				}

				return false;
			});

			pause.on('click', function() {
				var self = $(this);

				if (play.hasClass('isPlaying')) {
					play.removeClass('isPlaying');

					self.addClass('active');

					player.pauseVideo();

					clearInterval(progressCheck);
					progressCheck = null;
				} else {
					self.removeClass('active');

					play.trigger('click');
				}

				return false;
			});

			volume.on('click', function() {
				var self = $(this);

				if (self.hasClass('off')) {
					self.removeClass('off');

					player.unMute();
				} else {
					self.addClass('off');

					player.mute();
				}

				return false;
			});			
		});
	}	
	
	$(document).ready(function() {
		var video = video_container.find('#video_1'),
				avatar_holder = $('#identity #avatar');

		if (avatar_holder.length) {
			var json = {
				userId: userId,
				sessionId: sessionId,
				radius: 15,
				injectInto: 'avatar'
			}

		  	console.log(window.PORT);
		  	console.log(window.DOMAIN);
			var chooser = new sf.ifs.View.AvatarChooser(json, window.PORT, window.DOMAIN);
		}

		if (video.length) {
			video.createPlayer(false);
		}

		if (videos.length) {
			videos.on('click', function() {
				var self = $(this);

				self.createPlayer(true);

				return false;
			});
		}

		var help_btn = $('a.question');
		if (help_btn.length) {
			help_btn.fancybox({
				'transitionIn'		: 'none',
				'transitionOut'		: 'none',
				'type'				: 'iframe',
				'height' : 400,
				'autoScale' : 'false',
				'onClosed': function() {
					parent.location.reload(true);
				}			
			});
		}
	});
})(jQuery);





