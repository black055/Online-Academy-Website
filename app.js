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
const {User, Teacher, Admin, Course} = require('./utils/db');
require('./auth');

// Insert data sample
let names = ['Lê Thành Việt', 'Võ Trọng Gia Vinh', 'Nguyễn Văn Trường', 'Nguyễn Trần Trung', 'Lê Huỳnh Quang Trường'
, 'Bùi Thanh Uy', 'Phạm Hồng Vinh', 'Đặng Thị Hồng Xuyên', 'Lê Nhật Tuấn', 'Nguyễn Tân Vinh'];
let emails = ['lethanhviet@gmail.com', 'giavinh@gmail.com', 'vangtruong@gmail.com', 'trantrung@gmail.com', 'quantruong@gmail.com'
, 'thanhuy@gmail.com', 'hongvinh@gmail.com', 'hongxuyen@gmail.com', 'nhattuan@gmail.com', 'tanvinhgmail.com'];

// (async function insert() {
//     for(let index = 0; index < names.length; ++index) {
//         let hash = bcrypt.hashSync('22102000',10);
//         let user = await User.findOne({'email': emails[index]});
//         if (!user) {
//             user = new User({
//                 email: emails[index],
//                 name: names[index],
//                 password: hash,
//                 fbID: '',
//                 isValidated: true,
//                 OTP: null,
//                 ggID: '',
//                 userType: 'Student',
//                 bthday: new Date(2000,10,22),
//                 course:[],
//                 watchList: []
//             });
//             user.save();
//         }
//     }
// })();

// (async function course() {
//     for (let index = 0; index < 10; ++index) {
//         let course = new Course({
//             name: 'Khóa học chuyên sau NodeJS',
//             tags: [],
//             group: '',
//             chapters: [],
//             rate: [],
//             rating: 5,
//             price: 200,
//             teacher: 'Võ Trọng Gia Vinh',
//             students: 450,
//             comments: [],
//             description: 'Giáo Viên ngu lắm đừng học',
//             views: 1200,
//             saleOff: 0,
//         });
//         course.save();
//     }
// })();

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
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    },
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
    res.render('index', {isHome: true});
})

app.get('/about', mdwIsValidated, (req, res) => {
    res.render('about/about', {isAbout: true});
})

app.use('/courses',mdwIsValidated, require('./routes/courses/courses.route'));

app.get('/course', mdwIsValidated, (req, res) => {
    res.render('courses/course');
})

app.get('/contact', mdwIsValidated, (req, res) => {
    res.render('contact/contact');
})

app.get('/login', mdwIsValidated, (req, res) => {res.render('login') });


// Authentication
app.post('/login', passport.authenticate('local', {failureRedirect: '/login', successRedirect: '/'}));

app.get('/loginfb', passport.authenticate('facebook'));

app.get('/facebook', passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/login'}));

app.get('/logingg', passport.authenticate('google'));

app.get('/google', passport.authenticate('google', {successRedirect: '/', failureRedirect: '/login'}));

app.get('/logout', (req, res) => {
    req.logOut();
    req.session.user = null;
    res.redirect('/login');
});

app.use('/register', require('./routes/register/register.route'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`app is running at http://localhost:${PORT}`);
});