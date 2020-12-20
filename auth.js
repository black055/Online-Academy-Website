const passport = require('passport');
const express = require('express');
const {User} = require('./utils/db');
const bcrypt = require('bcrypt');
const LogcalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new LogcalStrategy({ usernameField: 'email',passwordField: 'password'}, async (username, password, done) => {
    const user = await User.findOne({'email': username});
    if (user) {
        if (await bcrypt.compareSync(password, user.password)) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } else {
        return done(null, false);
    }
}));

passport.use(new FacebookStrategy({
    clientID: '1063939974087421',
    clientSecret: '7f0e44d00765956f59d7f93a43477c9d',
    callbackURL: 'http://localhost:3000/facebook',
    profileFields: ['email', 'name', 'id'],
}, async function (accessToken, refreshToken, profile, done) {
    let {email, first_name, last_name, id} = profile._json;
    if (typeof email == 'undefined') email = '';
    let user = await User.findOne({'fbID': id});
    if(!user) {
        user = new User({
            email: email,
            name: last_name + first_name, 
            password: "",
            fbID: id, 
            isValidated: true,
            bthday: null,
            ggID: '',
            courses: [],
            userType: 'Student',
            watchList: [],})
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
    if(!user) {
        user = new User({
            email: profile.emails[0].value,
            name: profile.displayName, 
            password: "",
            fbID: "", 
            isValidated: true,
            bthday: null,
            ggID: profile.id,
            courses: [],
            userType: 'Student',
            watchList: [],})
        user.save();
    }
    done(null, user);
}))

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});