//-----------------------------------------------------------------------------
var checkImageFileExtension = function (event, formId, titleId, textId) {
    if (isEmpty(event)) return;
    if (isEmpty(formId)) return;
    if (isEmpty(titleId)) return;


    //	does this browser support event.files (IE tends not too, at least version 9 and lower)
    if (isEmpty(event.files)) {
        var fileName = event.value.split('\\').pop().toLowerCase();
        var extension = fileName.split('.').pop();
        var fileValid = true;
        var fileText = fileName;

        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                break;
            default:
                fileText = "Unknown Image type ('" + extension + "')";
                fileValid = false;
                break;
        }
    } else {
        var fileName = event.files[0].name;
        var fileType = event.files[0].type;
        var fileSize = event.files[0].size;
        var fileValid = true;
        var fileText = fileName;

        //	event.value.split('\\').pop();

        //	did we upload an image?
        if (fileType.substring(0, 5) != "image") {
            fileText = "Only images allowed";
            fileValid = false;
        } else {
            //	let's check what the image type was
            extension = fileType.substring(6);

            switch (extension) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                    break;
                default:
                    fileText = "Unknown Image type ('" + extension + "')";
                    fileValid = false;
                    break;
            }
        }

        if (fileSize > 2048000) {
            fileText = "Image is too big (" + Math.floor(fileSize / 1024) + "K)";
            fileValid = false;
        }
    }

    var placeHolderY = 320;

    resourceJSON = {
        type: 'image',
        label: fileText,
        isPlaceHolder: !fileValid,
        placeHolderY: placeHolderY,
        formID: formId,
        titleID: titleId,
        isLocal: false
    }

    if (!isEmpty(textId)) resourceJSON.textID = textId;
    window.getDashboard().setBrowseText(resourceJSON);
}

//-----------------------------------------------------------------------------
var checkAudioFileExtension = function (event, formId, titleId, textId) {
    if (isEmpty(event)) return;
    if (isEmpty(formId)) return;
    if (isEmpty(titleId)) return;

    if (isEmpty(event.files)) {
        var fileName = event.value.split('\\').pop().toLowerCase();
        var extension = fileName.split('.').pop();
        var fileValid = true;
        var fileText = fileName;

        switch (extension) {
            case 'mpeg':
            case 'mp3':
                break;
            default:
                fileText = "Unknown Audio file ('" + extension + "')";
                fileValid = false;
                break;
        }
    } else {
        var fileName = event.files[0].name;
        var fileType = event.files[0].type;
        var fileSize = event.files[0].size;
        var fileValid = true;
        var fileText = fileName;

        //	did we upload an image?
        if (fileType.substring(0, 5) != "audio") {
            fileText = "Only audio files allowed";
            fileValid = false;
        } else {
            //	let's check what the image type was
            extension = fileType.substring(6);

            switch (extension) {
                case 'mpeg':
                case 'mp3':
                    break;
                default:
                    fileText = "Unknown Audio file ('" + extension + "')";
                    fileValid = false;
                    break;
            }
        }

        if (fileSize > 2048000) {
            fileText = "Audio is too big (" + Math.floor(fileSize / 1024) + "K)";
            fileValid = false;
        }
    }

    var placeHolderY = 320;

    resourceJSON = {
        type: 'audio',
        label: fileText,
        isPlaceHolder: !fileValid,
        placeHolderY: placeHolderY,
        formID: formId,
        titleID: titleId,
        isLocal: false
    }
    if (!isEmpty(textId)) resourceJSON.textID = textId;
    window.getDashboard().setBrowseText(resourceJSON);
}
