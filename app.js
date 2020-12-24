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

const categoryModel = require("./models/category.model");
const userModel = require("./models/user.model");

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

    for (let i = 0; i < category_data.length; i++) {
      let category = new Category(category_data[i]);
      category.save();
    }

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

app.get("/", mdwIsValidated, async (req, res) => {
  req.session.user = req.user;
  const categories = await categoryModel.getMenuCategory();
  res.render("index", { isHome: true, categories: categories});
});

app.get("/about", mdwIsValidated, async (req, res) => {
  const categories = await categoryModel.getMenuCategory();
  res.render("about/about", { isAbout: true, categories: categories });
});

app.use("/courses", mdwIsValidated, require("./routes/courses/courses.route"));

app.get("/profile", mdwIsValidated, async (req, res) => {
  const categories = await categoryModel.getMenuCategory();
  if (req.user.userType == "Student") {
    totalMoney = await userModel.getTotalMoney(req.user._id);
    courses = await userModel.getCourses(req.user._id);
    res.render("profile/profile", {
      user: req.user,
      courses: courses,
      totalMoney: totalMoney,
      categories: categories
    });
  } else
    res.render("profile/profile", {
      user: req.user,
      categories: categories
    });
});

app.get("/contact", mdwIsValidated, async (req, res) => {
  const categories = await categoryModel.getMenuCategory();
  res.render("contact/contact", { categories: categories });
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
app.use('/category', require('./routes/category/category.route.js'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app is running at http://localhost:${PORT}`);
});
