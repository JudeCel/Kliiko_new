/*
    json = {
        formID: string,                 //  id of the <form> tag
        submitID: string,               //   id of the forms <input> tag
    }
*/
var uploadImage = function(json) {
    if (isEmpty(json)) return;
    if (isEmpty(json.formID)) return;
    if (isEmpty(json.submitID)) return;
 
    status('Choose a file :)');
 
    // Check to see when a user has selected a file                                                                                                                
    var timerId;
    timerId = setInterval(function() {
	if($('#' + json.submitID).val() !== '') {
            clearInterval(timerId);
 
            $('#' + json.formID).submit();
        }
    }, 500);
 
    $('#' + json.formID).submit(function() {
        status('uploading the file ...');
 
        $(this).ajaxSubmit({                                                                                                                 
 
            error: function(xhr) {
                status('Error: ' + xhr.status);
            },
 
            success: function(response) {
            }
	});
 
	// Have to stop the form from submitting and causing                                                                                                       
	// a page refresh - don't forget this                                                                                                                      
	return false;
    });
 
    //  TODO:   we can remove "status" later
    function status(message) {
	   $('#status').text(message);
    }
};