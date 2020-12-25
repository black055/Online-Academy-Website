const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const userModel = require('../../models/user.model');
const categoryModel = require('../../models/category.model')
const {User} = require('../../utils/db');

router.get("/", async (req, res) => {
  const categories = await categoryModel.getMenuCategory();
  const message = req.flash('message');

  if (req.user.userType == "Student") {
    totalMoney = await userModel.getTotalMoney(req.user._id);
    courses = await userModel.getCourses(req.user._id);
    watchlist = await userModel.getWatchlist(req.user._id);
    if (typeof message === 'undefined')
      res.render("profile/profile", { user: req.user, courses: courses, watchlist: watchlist,
        totalMoney: totalMoney, categories: categories });
    else
      res.render("profile/profile", { user: req.user, courses: courses, watchlist: watchlist,
        totalMoney: totalMoney, categories: categories, message: message });
  } else
  if (typeof message === 'undefined')
    res.render("profile/profile", { user: req.user, categories: categories });
  else
    res.render("profile/profile", { user: req.user, categories: categories, message: message });
      
});

router.post("/changePassword", async (req, res) => {
    const user = await userModel.getUser(req.user._id);
    if (bcrypt.compareSync(req.body.oldPass, user.password)) {
      const hash = bcrypt.hashSync(req.body.newPass, 10, (err, hash) => {
        if (err) {
            console.log(err);
        }
      });
      req.user.password = hash;
      user.password = hash;
      user.save();

      req.flash('message', {
        icon: 'success',
        title: 'Đổi mật khẩu thành công!',
        text: 'Cập nhật mật khẩu mới thành công!'
      } );
    } else {
      req.flash( 'message', {
        icon: 'error',
        title: 'Mật khẩu không khớp...',
        text: 'Mật khẩu đã nhập không trùng khớp với mật khẩu cũ!'
      } );
    }
    res.redirect("/profile");
});

module.exports = router;