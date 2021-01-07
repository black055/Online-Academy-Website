const mailer = require('nodemailer');

const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'verifycourseonline@gmail.com',
        pass: '22102000shch',
    }
});

module.exports = function (url, id, email, title, isResetPass = false) {
    let html = isResetPass ? '<h3>Nhấn vào link để thay đổi mật khẩu: <strong style="font-size: 15px;">' + url + '</strong></h3>' : '<h3>Nhấn vào link để xác thực tài khoản: <strong style="font-size: 15px;">' + url + '</strong></h3>'
    let mailOptions = {
        from: 'verifycourseonline@gmail.com',
        to: email,
        subject: title,
        html: html,
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) console.log(err);
    });
}