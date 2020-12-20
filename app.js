const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const hbs = require('express-handlebars');
const MongoStore = require('connect-mongo')(session);
const hbs_section = require('express-handlebars-sections');
const mdwIsValidated = require('./middlewares/validation.mdw');
require('./auth');

// Connect to database
mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true, useUnifiedTopology: true});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    cookie: {
        expires: 1000*60*60,
    },
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

// View engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    defaultLayout: 'main.hbs',
    helpers: {
        section: hbs_section(),
    }
}));

// Static resources
app.use(express.static(__dirname + '/public'));


app.get('/', mdwIsValidated, (req, res) => {
    req.session.user = req.user;
    res.render('index');
})

app.get('/about', mdwIsValidated, (req, res) => {
    res.render('about/about');
})

app.get('/courses', mdwIsValidated, (req, res) => {
    res.render('courses/courses');
})

app.get('/course', mdwIsValidated, (req, res) => {
    res.render('courses/course');
})

app.get('/profile', mdwIsValidated, (req, res) => {
    res.render('profile/profile')
})

app.get('/contact', mdwIsValidated, (req, res) => {
    res.render('contact/contact')
})

app.get('/login', mdwIsValidated, (req, res) => {res.render('login') });

app.post('/login', passport.authenticate('local', {failureRedirect: '/login', successRedirect: '/'}));

app.get('/loginfb', passport.authenticate('facebook'));

app.get('/facebook', passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/login'}));

app.get('/logingg', passport.authenticate('google'));

app.get('/google', passport.authenticate('google', {successRedirect: '/', failureRedirect: '/login'}));

app.get('/logout', (req, res) => {
    req.logOut();
    req.session.user = null;
    res.redirect('/login');
})

app.use('/register', require('./routes/register/register.route'));

app.listen(3000);
console.log('App listening at http://localhost:3000');