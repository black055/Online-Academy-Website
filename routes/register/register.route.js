const express = require('express');
const {User, Teacher} = require('../../utils/db');
const router = express.Router();
const bcrypt = require('bcrypt');
const sendMail = require('../../mailer');
const linkAuth = require('../../middlewares/linkAuth.mdw');

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
        let otp = Math.floor(Math.random() * 999999) + 100000;
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
            gitID: "",
            courses: [],
            userType: 'Student',
            watchList: [],
            cart: []
        });
        user.save();
        req.session.user_invalidated = user;
        const url = req.protocol + "://" + req.headers.host + "/register/" + user._id + "/" + otp;
        sendMail(url, user._id, email, "Vui lòng xác thực tài khoản!");
        res.redirect('/register/OTP');
    } else {
        res.redirect('/register');
    }
});

router.get('/OTP', (req, res) => {
    res.render('OTP');
});

router.get('/:id/:otp', linkAuth, async (req, res) => {
    if (req.session.user_invalidated) {
        const user = await User.findOne({'email': req.session.user_invalidated.email});
        if (req.params.otp == user.OTP && req.params.id == user._id) {
            await User.updateOne({'email': user.email}, {OTP: null, isValidated: true});
            req.session.user_invalidated = null;
            res.redirect('/login');
        } else {
            req.flash("err_OTP", "Đường link xác thực không hợp lệ !");
            res.redirect('/register/OTP');
        }
    } else if (req.user) {
        const user = await User.findOne({'email': req.user.email});
        if (req.params.otp == user.OTP && req.params.id == user._id) {
            await User.updateOne({'email': user.email}, {OTP: null, isValidated: true});
            req.user.isValidated = true;
            req.user.OTP = null;
            req.logIn(user, function(err) {
                console.log(err);
            });
            res.redirect('/');
        } else {
            req.flash("err_OTP", "Đường link xác thực không hợp lệ !");
            res.redirect('/register/OTP');
        }
    }
});

router.get('/resendOTP', async (req, res) => {
    if (req.session.user_invalidated) {
        const user = await User.findOne({'email': req.session.user_invalidated.email});
        let otp = Math.floor(Math.random() * 999999) + 100000;
        user.OTP = otp;
        user.save();
        const url = req.protocol + "://" + req.headers.host + "/register/" + user._id + "/" + otp;
        sendMail(url, user._id, user.email, "Vui lòng xác thực tài khoản!");
        res.send(true);
    } else if (req.user) {
        const user = await User.findOne({'email': req.user.email});
        otp = Math.floor(Math.random() * 999999) + 100000;
        user.OTP = otp;
        user.save();
        const url = req.protocol + "://" + req.headers.host + "/register/" + user._id + "/" + otp;
        sendMail(url, user._id, user.email, "Vui lòng xác thực tài khoản!");
        res.send(true);
    }
});

module.exports = router;