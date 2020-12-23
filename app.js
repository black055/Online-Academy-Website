const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const hbs = require("express-handlebars");
const MongoStore = require("connect-mongo")(session);
const hbs_section = require("express-handlebars-sections");
const mdwIsValidated = require("./middlewares/validation.mdw");
const { User, Teacher, Admin, Course, Category } = require("./utils/db");
const {user_data, course_data, category_data} = require('./utils/insert');

const userModel = require("./models/user.model.js");

require("./auth");

// Connect to database
mongoose.connect("mongodb://localhost:27017/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// Insert data user
/*(async function b() {
    for (let i = 0; i < user_data.length; i++) {
        let user = await User.findOne({'email': user_data[i].email});
        if (!user) {
            user = new User(user_data[i]);
            user.save();
        }
    }

    for (let i = 0; i < course_data.length; i++) {
        let course = new Course(course_data[i]);
        course.save();
    }

  category = new Category({_id: mongoose.Types.ObjectId("000000000000000000000001"), "name": "Công nghệ thông tin"});category.save();
  category = new Category({_id: mongoose.Types.ObjectId("000000000000000000000002"), "name": "Toán học"});category.save();
  category = new Category({_id: mongoose.Types.ObjectId("000000000000000000000003"), "name": "Lập trình Web", "parentCategory": mongoose.Types.ObjectId("000000000000000000000001")});category.save();
  category = new Category({_id: mongoose.Types.ObjectId("000000000000000000000004"), "name": "Lập trình ứng dụng di động", "parentCategory": mongoose.Types.ObjectId("000000000000000000000001")});category.save();
  category = new Category({_id: mongoose.Types.ObjectId("000000000000000000000005"), "name": "Khoa học máy tính", "parentCategory": mongoose.Types.ObjectId("000000000000000000000001")});category.save();
  category = new Category({_id: mongoose.Types.ObjectId("000000000000000000000006"), "name": "Hệ thống thông tin", "parentCategory": mongoose.Types.ObjectId("000000000000000000000001")});category.save();
  category = new Category({_id: mongoose.Types.ObjectId("000000000000000000000007"), "name": "Toán tổ hợp", "parentCategory": mongoose.Types.ObjectId("000000000000000000000002")});category.save();
  category = new Category({_id: mongoose.Types.ObjectId("000000000000000000000008"), "name": "Toán rời rạc", "parentCategory": mongoose.Types.ObjectId("000000000000000000000002")});category.save();
  category = new Category({_id: mongoose.Types.ObjectId("000000000000000000000009"), "name": "Xác suất thống kê", "parentCategory": mongoose.Types.ObjectId("000000000000000000000002")});category.save();
})();*/

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true,
    cookie: {
      expires: 1000 * 60 * 60,
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

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

// Static resources
app.use(express.static(__dirname + "/public"));

app.get("/", mdwIsValidated, (req, res) => {
  req.session.user = req.user;
  res.render("index", { isHome: true });
});

app.get("/about", mdwIsValidated, (req, res) => {
  res.render("about/about", { isAbout: true });
});

app.use("/courses", mdwIsValidated, require("./routes/courses/courses.route"));

app.get("/profile", mdwIsValidated, async (req, res) => {
  if (req.user.userType == "Student") {
    totalMoney = await userModel.getTotalMoney(req.user._id);
    courses = await userModel.getCourses(req.user._id);
    res.render("profile/profile", {
      user: req.user,
      courses: courses,
      totalMoney: totalMoney,
    });
  } else
    res.render("profile/profile", {
      user: req.user,
    });
});

app.get("/contact", mdwIsValidated, (req, res) => {
  res.render("contact/contact");
});

app.get("/login", mdwIsValidated, (req, res) => {
  res.render("login");
});

// Authentication
app.post("/login", passport.authenticate("local", {failureRedirect: "/login", successRedirect: "/",}));

app.get("/loginfb", passport.authenticate("facebook"));

app.get("/facebook", passport.authenticate("facebook", {successRedirect: "/", failureRedirect: "/login",}));

app.get("/logingg", passport.authenticate("google"));

app.get("/google", passport.authenticate("google", {successRedirect: "/", failureRedirect: "/login",}));

app.get("/logout", (req, res) => {
  req.logOut();
  req.session.user = null;
  res.redirect("/login");
});

app.use('/register', require('./routes/register/register.route'));
app.use('/teacher', require('./routes/teacher/teacher.route'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app is running at http://localhost:${PORT}`);
});
