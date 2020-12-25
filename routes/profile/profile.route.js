const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const courseModel = require('../../models/courses.model');
const userModel = require('../../models/user.model');
const categoryModel = require('../../models/category.model')

router.get("/", async (req, res) => {
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

router.post("/changePassword", async (req, res) => {
    const user = await userModel.getUser(req.user._id);
    if (bcrypt.compareSync(req.body.oldPass, user.password)) {
        console.log("ok");
    }
    res.redirect("/profile");
});

module.exports = router;