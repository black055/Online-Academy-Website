const mongoose = require("mongoose");
const moment = require('moment');
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const hbs = require("express-handlebars");
const flash = require('req-flash');
const MongoStore = require("connect-mongo")(session);
const bcrypt = require('bcrypt');
const hbs_section = require("express-handlebars-sections");
const schedule = require('node-schedule');
const mdwIsValidated = require("./middlewares/validation.mdw");
const mdwIsLoged = require("./middlewares/Loged.mdw");
const userModel = require('./models/user.model');
const categoryModel = require('./models/category.model');
const coursesModel = require('./models/courses.model')
const {User, Teacher, Admin, Course, Category} = require('./utils/db');
const {user_data, course_data, category_data, teacher_data} = require('./utils/insert');

require("./auth");

// Connect to database
mongoose.connect("mongodb://localhost:27017/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.set("useCreateIndex", true);
//Insert data user
// (async function b() {
//   for (let i = 0; i < user_data.length; i++) {
//       let user = await User.findOne({'email': user_data[i].email});
//       if (!user) {
//           user = new User(user_data[i]);
//           user.save();
//       }
//   }

//   for (let i = 0; i < course_data.length; i++) {
//     let course = await Course.findOne({ 'name': course_data[i].name});
//     if (course == null) {
//       course = new Course(course_data[i]);
//       course.save();
//     }
//   }

//   for (let i = 0; i < category_data.length; i++) {
//     let category = await Category.findOne({ 'name': category_data[i].name});
//     if (category == null) {
//       category = new Category(category_data[i]);
//       category.save();
//     }
//   }

//   for (let i = 0; i < teacher_data.length; i++) {
//     let teacher = new Teacher(teacher_data[i]);
//     teacher.save();
//   }

//   const admin = new Admin({username: 'admin', password: bcrypt.hashSync('22102000', 10), userType: 'Admin'});
//   admin.save();
// })(); 

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true,
    cookie: {
      expires: 1000 * 60 * 60 * 24 * 30,
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

// View engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.engine(
  "hbs",
  hbs({
    extname: ".hbs",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    layoutsDir: path.join(__dirname, "views/layouts"),
    defaultLayout: "main.hbs",
    helpers: {
      section: hbs_section(),
      inc: (index) => {return ++index},
    },
  })
);

const handlebars = hbs.create({});
handlebars.handlebars.registerHelper(
  "ifEquals",
  function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  }
);
handlebars.handlebars.registerHelper('formatTime', function (date, format) {
  var mmnt = moment(date);
  result = mmnt.format(format);
  if (result != 'Invalid date') {
    return result;
  }
  return '';
});

// Static resources
app.use(express.static(__dirname + "/public"));

// Schedule to reset soldInWeek and viewInWeek

var sche = schedule.scheduleJob({hour: 0, minute: 0, dayOfWeek: 1}, function() {
  categoryModel.resetSoldInWeek();
  coursesModel.resetSoldInWeek();
});

// Middleware for getting cart for guest and user
app.use(async function(req, res, next) {
  if (typeof req.session.cart == 'undefined') 
    req.session.cart = [];

  if (req.user && req.user.userType == 'Student') {
    for (let i = 0; i < req.session.cart.length; i++) {
      let isRegistered = false;
      let isExist = false;
      req.user.courses.forEach(course => {
        if (Object.keys(course)[0] == req.session.cart[i])
          isRegistered = true;
      });

      if (isRegistered)
        continue;
      if (req.user.cart.includes(req.session.cart[i])) 
        isExist = true;
      if (isExist)
        continue;
      
      let cart = req.user.cart;
      cart.push(req.session.cart[i]);
      await userModel.addCart(req.user._id, cart);
      let user = await userModel.getUser(req.user._id);
      user.save();
      req.logIn(user, function (err) {
        console.log(err);
      });
    }
    req.session.cart = [];
    req.session.coursesInCart = [];
  }

  if (req.session.cart.length > 0) {
    let coursesInCart = [];
    for (let i = 0; i < req.session.cart.length; i++) {
      let course = await coursesModel.getCourse(req.session.cart[i]);
      coursesInCart.push(course);
    }
    req.session.coursesInCart = coursesInCart;
  }

  next();
});

// Middleware for get categories and course in cart for student
app.use(async function (req, res, next) {
  req.session.user = req.user;
  const categories = await categoryModel.getMenuCategory();
  req.session.categories = categories;
  if (req.user && req.user.userType == 'Student') {
    let coursesInCart = [];
    for (let index = 0; index < req.user.cart.length; index++) {
      let course = await coursesModel.getCourse(req.user.cart[index]);
      coursesInCart.push(course);
    }
    req.session.coursesInCart = coursesInCart;
  }
  next();
});

app.get("/", mdwIsValidated, async (req, res) => {
  if (req.user && req.user.userType == 'Teacher')
    return res.redirect('/course');
  if (req.user && req.user.userType == 'Admin')
    return res.redirect('/admin');
  else return res.render("index", { isHome: true});
});

app.get("/about", mdwIsValidated, async (req, res) => {
  res.render("about/about", { isAbout: true});
});

app.get("/contact", mdwIsValidated, async (req, res) => {
  res.render("contact/contact");
});

app.get("/login", mdwIsValidated, (req, res) => {
  if (typeof req.user !== "undefined")
    res.redirect('/');
  else res.render("login");
});

// Authentication
app.post("/login", passport.authenticate("local", {failureRedirect: "/login", successRedirect: "/",}));

app.get("/loginfb", passport.authenticate("facebook"));

app.get("/facebook", passport.authenticate("facebook", {successRedirect: "/", failureRedirect: "/login",}));

app.get("/logingg", passport.authenticate("google"));

app.get("/google", passport.authenticate("google", {successRedirect: "/", failureRedirect: "/login",}));

app.get("/logout", (req, res) => {
  req.logOut();
  req.session.destroy();
  res.redirect("/login");
});

app.use("/courses", mdwIsValidated, require("./routes/courses/courses.route"));
app.use("/profile", mdwIsLoged, mdwIsValidated, require("./routes/profile/profile.route"));
app.use('/register', require('./routes/register/register.route'));
app.use('/course', mdwIsLoged, require('./routes/course/course.route'));
app.use('/category', require('./routes/category/category.route'));
app.use('/admin', mdwIsLoged, require('./routes/admin/admin.route'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app is running at http://localhost:${PORT}`);
});
