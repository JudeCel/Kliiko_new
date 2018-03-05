var Vimeo = require('vimeo').Vimeo;
var client = new Vimeo('13cab2bd03d6db3f88aff0f0e05f2034f3e6339e',
                        '52qFDkQNFpS/fnPR+3KWe9n0pvlXnqZHWuGBhk1TzqB14pOCEwDUNKX+nj8+I73FXQKkC8oUCmSuMDlZQVk659tfLEX5uGe8M093f/78r58pmbAYqcmaDLTbRTXzjIQU',
                        'bcd27d93d62c8acd8adfb7b1c6830516');
/*
{
    "access_token": "bcd27d93d62c8acd8adfb7b1c6830516",
    "token_type": "bearer",
    "scope": "public",
    "app": {
        "name": "cliizii",
        "uri": "/apps/122139"
    }
}
*/

module.exports = {
    getUserVideos: getUserVideos
};

function getUserVideos(callback) {
    client.request({
        path: '/users/50909844/videos?sort=modified_time',
        query: {
            //page: 1,
            //per_page: 10,
            fields: 'name,uri,pictures.sizes.link'
        }
    }, function (error, body, status_code, headers) {
        if (error) {
            console.log('Vimeo error: ', error);
        } else {
            callback(body.data);
        }
    });
}