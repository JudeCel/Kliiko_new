module.exports = function(app,restUrl) {
    var restUrl = restUrl+'/upgrade';



    app.post(restUrl, function (req, res) {
        req.user ? proceed() : notAuthExit(res);

        function proceed() {
           res.send(req.body)
        }

    });


    //Common not authorized message
    function notAuthExit(res) {
        res.status(403).send('not authorized');
    }


};

