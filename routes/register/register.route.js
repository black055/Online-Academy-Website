const express = require('express');
const {User, Teacher} = require('../../utils/db');
const mailer = require('nodemailer');
const router = express.Router();
const bcrypt = require('bcrypt');

var otp;

const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'verifycourseonline@gmail.com',
        pass: '22102000shch',
    }
});

router.get('/', (req, res) => {
    res.render('register');
});

router.get('/checkMail/:email', async (req, res) => {
    const user = await User.findOne({'email': req.params.email});
    const teacher = await Teacher.findOne({'email': req.params.email});
    if (user || teacher) res.send(true);
    else res.send(false);
})

router.post('/checkPassword', async (req, res) => {
    const user = await User.findOne({'email': req.body.email});
    if (bcrypt.compareSync(req.body.oldPass, user.password)) {
        res.send(true);
    }
    else res.send(false);
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
        otp = Math.floor(Math.random() * 999999) + 100000;
        const user = new User({
            email: email, 
            name: name, 
            phone: '',
            gender: '',
            password: hash, 
            fbID: '', 
            isValidated: false,
            OTP: otp,
            bthday: null,
            ggID: '',
            courses: [],
            userType: 'Student',
            watchList: [],
            cart: []
        });
        user.save();
        req.session.user_invalidated = user;
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
});

router.get('/OTP', (req, res) => {
    res.render('OTP');
});

router.post('/OTP',async (req, res) => {
    if (req.session.user_invalidated) {
        const user = await User.findOne({'email': req.session.user_invalidated.email});
        if (req.body.otp == user.OTP) {
            await User.updateOne({'email': user.email}, {OTP: null, isValidated: true});
            res.redirect('/login');
        } else {
            res.redirect('/register/OTP');
        }
    } else if (req.user) {
        const user = await User.findOne({'email': req.user.email});
        if (req.body.otp == user.OTP) {
            await User.updateOne({'email': user.email}, {OTP: null, isValidated: true});
            req.user.isValidated = true;
            req.user.OTP = null;
            res.redirect('/');
        } else {
            res.redirect('/register/OTP');
        }
    }
});

router.get('resendOTP', (req, res) => {

});

module.exports = router;