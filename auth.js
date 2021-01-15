const passport = require('passport');
const express = require('express');
const {User, Teacher, Admin} = require('./utils/db');
const bcrypt = require('bcrypt');
const LogcalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GithubStrategy = require('passport-github2').Strategy;

passport.use(new LogcalStrategy({ usernameField: 'email',passwordField: 'password'}, async (username, password, done) => {
    const user = await User.findOne({'email': username});
    const teacher = await Teacher.findOne({'email': username});
    const admin = await Admin.findOne({'username': username});

    if (user) {
        if (!user.isAvailable) 
            return done(null, false, {message: "Tài khoản của bạn đã bị vô hiệu hóa !"});
        if (await bcrypt.compareSync(password, user.password)) {
            return done(null, user);
        } else {
            return done(null, false, {message: "Tên đăng nhập hoặc mật khẩu không đúng !"});
        }
    } else if (teacher) {
        if (!teacher.isAvailable) 
            return done(null, false, {message: "Tài khoản của bạn đã bị vô hiệu hóa !"});
        if (await bcrypt.compareSync(password, teacher.password)) {
            return done(null, teacher);
        } else {
            return done(null, false, {message: "Tên đăng nhập hoặc mật khẩu không đúng !"});
        }
    } else if (admin) {
        if (await bcrypt.compareSync(password, admin.password)) {
            return done(null, admin);
        } else {
            return done(null, false , {message: "Tên đăng nhập hoặc mật khẩu không đúng !"});
        }
    } else {
        return done(null, false, {message: "Tên đăng nhập hoặc mật khẩu không đúng !"});
    }
}));

passport.use(new FacebookStrategy({
    clientID: '1063939974087421',
    clientSecret: '7f0e44d00765956f59d7f93a43477c9d',
    callbackURL: 'http://localhost:3000/facebook',
    profileFields: ["id", "email", "first_name", "last_name"],
}, async function (accessToken, refreshToken, profile, done) {
    let {email, first_name, last_name, id} = profile._json;
    if (typeof email == 'undefined') email = '';
    let user = await User.findOne({'fbID': id});
    if (user && !user.isAvailable) 
        return done(null, false, {message: "Tài khoản của bạn đã bị vô hiệu hóa !"});
    if(!user) {
        user = new User({
            email: email,
            name: last_name + first_name, 
            phone: "",
            gender: "",
            password: "",
            fbID: id, 
            isValidated: true,
            bthday: null,
            ggID: '',
            gitID: "",
            twID: "",
            OTP: null,
            bthday: null,
            courses: [],
            userType: 'Student',
            watchList: [],
            cart: [],
        })
        user.save();
    }
    done(null, user);
}));

passport.use(new GoogleStrategy({
    clientID: '478914281957-mq98gv0ooageuh3l3cde0l40h7opjrui.apps.googleusercontent.com',
    clientSecret: 'Xj3z04b0eMJrVjzIcEgQRv_K',
    callbackURL: 'http://localhost:3000/google',
    scope: ['profile', 'email'],
},async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({'ggID': profile.id});
    if (user && !user.isAvailable) 
        return done(null, false, {message: "Tài khoản của bạn đã bị vô hiệu hóa !"});
    if(!user) {
        user = new User({
            email: profile.emails[0].value,
            name: profile.displayName, 
            phone: "",
            gender: "",
            password: "",
            fbID: "", 
            isValidated: true,
            bthday: null,
            ggID: profile.id,
            gitID: "",
            twID: "",
            OTP: null,
            bthday: null,
            courses: [],
            userType: 'Student',
            watchList: [],
            cart: [],
        })
        user.save();
    }
    done(null, user);
}));

passport.use(new GithubStrategy({
    clientID: "b9b9b2388724cfbd9211",
    clientSecret: "11dde68a97695c8591348d175d5d31d0b8d978ad",
    callbackURL: "http://localhost:3000/github",
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({'gitID': profile.id});
    if (user && !user.isAvailable) 
        return done(null, false, {message: "Tài khoản của bạn đã bị vô hiệu hóa !"});
    if(!user) {
        user = new User({
            email: "",
            name: profile.displayName, 
            phone: "",
            gender: "",
            password: "",
            fbID: "", 
            isValidated: true,
            bthday: null,
            ggID: "",
            gitID: profile.id,
            twID: "",
            OTP: null,
            bthday: null,
            courses: [],
            userType: 'Student',
            watchList: [],
            cart: [],
        })
        user.save();
    }
    done(null, user);
}));

passport.use(new TwitterStrategy({
    consumerKey: "wu7mjJFb20U6vuMgqzy2JuFmp",
    consumerSecret: "hXCuwxkt0ADDPYocdHGBFzUInEVdW7F9rl2iEPzecYrix69bP9",
    callbackURL: "http://localhost:3000/twitter",
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({'twID': profile.id});
    if (user && !user.isAvailable) 
        return done(null, false, {message: "Tài khoản của bạn đã bị vô hiệu hóa !"});
    if(!user) {
        user = new User({
            email: "",
            name: profile.displayName, 
            phone: "",
            gender: "",
            password: "",
            fbID: "", 
            isValidated: true,
            bthday: null,
            ggID: "",
            gitID: "",
            twID: profile.id,
            OTP: null,
            bthday: null,
            courses: [],
            userType: 'Student',
            watchList: [],
            cart: [],
        })
        user.save();
    }
    done(null, user);
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});