const mongoose = require("mongoose");
const moment = require('moment');
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const hbs = require("express-handlebars");
const flash = require('req-flash');
const cnFlash = require('connect-flash')
const MongoStore = require("connect-mongo")(session);
const bcrypt = require('bcrypt');
const hbs_section = require("express-handlebars-sections");
const schedule = require('node-schedule');

// Declare for models
const teacherModel = require('./models/teacher.model');
const userModel = require('./models/user.model');
const categoryModel = require('./models/category.model');
const coursesModel = require('./models/courses.model');

// Declare for middlewares
const mdwIsValidated = require("./middlewares/validation.mdw");
const mdwIsLoged = require("./middlewares/Loged.mdw");
const cartMiddleware = require('./middlewares/cart.mdw');
const categoriesMiddleware = require('./middlewares/categories.mdw');

// Script insert data
const insertData = require('./script_insert');

// Authentication
require("./auth");

// Connect to database
mongoose.connect("mongodb://localhost:27017/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.set("useCreateIndex", true);

//Insert data user
//insertData();

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
app.use(cnFlash());
app.use(function (req, res, next) {
  res.locals.session = req.session;
  res.locals.errorLogin = req.flash("error");
  res.locals.errorOTP = req.flash("err_OTP");
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
app.use(cartMiddleware);

// Middleware for get categories and course in cart for student
app.use(categoriesMiddleware);

app.use("/", mdwIsValidated, require('./routes/home/home.route'));

app.get("/about", mdwIsValidated, async (req, res) => {
  res.render("about/about", { isAbout: true});
});

app.get("/contact", mdwIsValidated, async (req, res) => {
  res.render("contact/contact");
});

app.use("/forgotPassWord", require('./routes/resetpass/resetPassword'));

app.get("/login", mdwIsValidated, (req, res) => {
  if (typeof req.user !== "undefined")
    res.redirect('/');
  else res.render("login");
});

// Authentication
app.post("/login",passport.authenticate("local", {failureRedirect: "/login", successRedirect: "/", failureFlash: true}));
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
