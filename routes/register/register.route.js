const express = require('express');
const {User} = require('../../utils/db');
const mailer = require('nodemailer');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');

var otp;

const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'verifycourseonline@gmail.com',
        pass: '22102000shch',
    }
})

router.get('/', (req, res) => {
    res.render('register');
})

router.post('/', async (req, res) => {
    const {email, name, password} = req.body;
    const user = await User.findOne({'email': email});
    if (!user) {
        const hash = await bcrypt.hashSync(password, 10, (err, hash) => {
            if (err) {
                console.log(err);
            }
        });
        const user = new User({
            email: email, 
            name: name, 
            password: hash, 
            fbID: '', 
            isValidated: false,
            bthday: null,
            ggID: '',
            courses: [],
            userType: 'Student',
            watchList: [],
        });
        user.save();
        console.log(user._id);
        otp = Math.floor(Math.random() * 999999) + 100000;
        let mailOptions = {
            from: 'verifycourseonline@gmail.com',
            to: email,
            subject: 'Welcome to our website, Please validate your account',
            html: '<h3>Here is you OTP code: <strong style="font-size: 15px;">' + otp + '</strong></h3>',
        }
        transporter.sendMail(mailOptions, function (err, data) {
            if (err) console.log(err);
        })
        res.redirect('/register/OTP');
    } else {
        res.redirect('/register');
    }
})

router.get('/OTP', (req, res) => {
    res.render('OTP');
})

router.post('/OTP', (req, res) => {
    if (req.body.otp == otp) {
        res.redirect('/login');
    } else {
        res.redirect('/register/OTP');
    }
});

router.get('resendOTP', (req, res) => {

})

module.exports = router;