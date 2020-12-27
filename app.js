const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const hbs = require("express-handlebars");
const flash = require('req-flash');
const MongoStore = require("connect-mongo")(session);
const hbs_section = require("express-handlebars-sections");
const mdwIsValidated = require("./middlewares/validation.mdw");
const mdwIsLoged = require("./middlewares/Loged.mdw");
const {User, Teacher, Admin, Course, Category} = require('./utils/db');
const {user_data, course_data, category_data, teacher_data} = require('./utils/insert');

const categoryModel = require("./models/category.model");
const userModel = require("./models/user.model");
const coursesModel = require("./models/courses.model");

require("./auth");

// Connect to database
mongoose.connect("mongodb://localhost:27017/mydb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// Insert data user
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
      expires: 1000 * 60 * 60,
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
    return res.redirect('/teacher');
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
  req.session.user = null;
  res.redirect("/login");
});

app.use("/courses", mdwIsValidated, require("./routes/courses/courses.route"));
app.use("/profile", mdwIsLoged, mdwIsValidated, require("./routes/profile/profile.route"));
app.use('/register', require('./routes/register/register.route'));
app.use('/teacher', mdwIsLoged, require('./routes/teacher/teacher.route'));
app.use('/category', require('./routes/category/category.route'));
app.use('/admin', mdwIsLoged, require('./routes/admin/admin.route'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app is running at http://localhost:${PORT}`);
});
