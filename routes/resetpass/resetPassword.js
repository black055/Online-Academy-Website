const express = require('express');
const router = express.Router();
const {User} = require('../../utils/db');
const mailer = require('nodemailer');
const bcrypt = require('bcrypt');
const sendMail = require('../../mailer');

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
    let otp = Math.floor(Math.random() * 999999999) + 100000000;
    const url = req.protocol + "://" + req.headers.host + "/forgotPassWord/" + user._id + "/" + otp;
    sendMail(url, user._id, user.email, "Thay đổi mật khẩu tài khoản của bạn !", true);
    user.OTP = otp;
    user.save();
    res.redirect('/login');
});

router.post('/reset/:id/', async (req, res) => {
    let user = await User.findOne({"_id": req.params.id});
    let hash = bcrypt.hashSync(req.body.pass1, 10);
    user.password = hash;
    user.save();
    res.redirect('/login');
});

router.get('/:id/:otp', async (req, res) => {
    let user = await User.findOne({"_id": req.params.id.toString()});
    if (user && user.OTP == req.params.otp) {
        user.save();
        res.render("resetPass", {user: user});
    } else  res.redirect('/');
});

module.exports = router;