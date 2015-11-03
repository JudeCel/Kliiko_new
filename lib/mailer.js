var nodemailer = require('nodemailer');

function sendMail(message, params, callback) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'insiderfocus.noreply',
            pass: 'ifs_Zupper!pwd'
        }
    });

    transporter.sendMail({
        from: 'Insider Focus <insiderfocus.noreply@gmail.com>',
        to: params.to,
        subject: params.subject,
        html: message
    }, callback);

}

module.exports = sendMail;