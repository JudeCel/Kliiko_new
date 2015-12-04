/**
 * Created by alex.sitdikov on 13.11.2015.
 */
'use strict';

/* App Module */

var kliikoApp = angular.module('KliikoApp', [])
    .controller('DashboardCtrl', ['$scope',
    function($scope) {

    }]);


$('#play-video').on('click',function(){
  if($('#video-placeholder').css('display')!='none'){
    $('#video').show().siblings('div').hide();
  }else if($('#video').css('display')!='none'){
    $('#video-placeholder').show().siblings('div').hide();
  }
});

 $("#play-video").click(function(){
  player = new YT.Player('player', {
    width : '100%',
    height : '100%',
    videoId : 'fhaIsQtKl4s',
    playerVars: { 'autoplay': 1 },
    events : {
      'onReady' : onPlayerReady,
      'onStateChange' : onPlayerStateChange
    }
  });
});

$(".non-resubmitable").submit(function() {
    $(this).submit(function() {
        return false;
    });
    return true;
});

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onPlayerReady(event) {
    //event.target.playVideo();
}
function onPlayerStateChange(event) {
  if(event.data == YT.PlayerState.ENDED) {
    player.destroy();
  }
}

$('form.changePasswordForm').keypress(function (e) {
  if(e.which == 13) {
    $('button#changePasswordButton').click();
    return false;
  }
});

$('#changePasswordModal').on('hidden.bs.modal', function () {
  $('#changePasswordMessage').html('');
  $('#changePasswordError').html('');
  $('#password').val('');
  $('#repassword').val('');
})

$(function() {
  $('button#changePasswordButton').click(function() {
    var button = this;
    $(button).prop('disabled', true);
    $.ajax({
      type: 'POST',
      url: '/dashboard/changepassword',
      data: $('form.changePasswordForm').serialize(),
      success: function(data, ajaxOptions) {
        $(button).prop('disabled', false);
        $('#changePasswordMessage').html(data.message);
        $('#changePasswordError').html('');
        $('#password').val('');
        $('#repassword').val('');
        setTimeout(function() {
          $('#changePasswordMessage').html('');
          $('#changePasswordModal').modal('hide');
        }, 1500);
      },
      error: function(xhr, ajaxOptions, thrownError) {
        $(button).prop('disabled', false);
        $('#changePasswordMessage').html('');
        $('#changePasswordError').html(xhr.responseJSON.error);
        $('#password').val('');
        $('#repassword').val('');
      }
    });
  });
});
