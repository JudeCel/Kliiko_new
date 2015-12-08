module.exports = function(app,restUrl) {
    var restUrl = restUrl+'/country-data';


    /**
     * Share link for file
     */
    app.get(restUrl, function (req, res) {

        console.log(req.user);

        res.send('country-data');
    });



};

