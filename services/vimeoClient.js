var Vimeo = require('vimeo').Vimeo;
var client = new Vimeo(process.env.VIMEO_CLIENT_ID,
                        process.env.VIMEO_SECRET,
                        process.env.VIMEO_ACCESS_TOKEN);
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