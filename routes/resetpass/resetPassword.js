const express = require('express');
const router = express.Router();
const {User} = require('../../utils/db');
const mailer = require('nodemailer');
const bcrypt = require('bcrypt');

const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'verifycourseonline@gmail.com',
        pass: '22102000shch',
    }
});


router.get('/', (req, res) => {
    res.render('forgotPass');
});

router.get('/checkmail/:email', async (req, res) => {
    const user = await User.findOne({"email": req.params.email});
    if (user && user.fbID.length == 0 && user.ggID.length == 0) res.send(true);
    else res.send(false);
});

router.post('/', async (req, res) => {
    const email = req.body.email;
    let user = await User.findOne({"email": email});
    let newPassword = Math.floor(Math.random() * 999999999) + 100000000;
    let mailOptions = {
        from: 'verifycourseonline@gmail.com',
        to: email,
        subject: 'Reset password',
        html: '<h3>Here is your new password: <strong style="font-size: 15px;">' + newPassword + '</strong></h3>',
    }
    transporter.sendMail(mailOptions, function (err, data) {
        if (err) console.log(err);
    });
    newPassword = bcrypt.hashSync(newPassword.toString(), 10);
    user.password = newPassword;
    user.save();
    res.redirect('/login');
});

module.exports = router;