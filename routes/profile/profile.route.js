const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mailer = require('nodemailer');
const userModel = require('../../models/user.model');
const categoryModel = require('../../models/category.model')
const {User} = require('../../utils/db');

const transporter = mailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'verifycourseonline@gmail.com',
      pass: '22102000shch',
  }
})

router.get("/", async (req, res) => {
  const message = req.flash('message');

  if (req.user.userType == "Student") {
    totalMoney = await userModel.getTotalMoney(req.user._id);
    courses = await userModel.getCourses(req.user._id);
    watchlist = await userModel.getWatchlist(req.user._id);
    if (typeof message === 'undefined')
      res.render("profile/profile", { courses: courses, watchlist: watchlist,
        totalMoney: totalMoney });
    else
      res.render("profile/profile", { courses: courses, watchlist: watchlist,
        totalMoney: totalMoney, message: message });
  } else {
    if (typeof message === 'undefined')
      res.render("profile/profile");
    else
      res.render("profile/profile", { message: message });
  }
      
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

router.post("/edit", async (req, res) => {
  const user = await userModel.getUser(req.user._id);
  user.name = req.body.name; req.user.name = req.body.name;
  user.bthday = req.body.bthday; req.user.bthday = req.body.bthday;
  user.gender = req.body.gender; req.user.gender = req.body.gender;
  user.phone = req.body.phone; req.user.phone = req.body.phone;
  user.save();
  req.flash('message', {
    icon: 'success',
    title: 'Cập nhật thành công!',
    text: 'Cập nhật thông tin cá nhân thành công!'
  } );
  res.redirect("/profile");
});

router.post("/changeEmail", async (req, res) => {
  const checkEmail = await userModel.getUserByEmail(req.body.newEmail);
  if (checkEmail === null) {
    const user = await userModel.getUser(req.user._id);

    if (bcrypt.compareSync(req.body.passConfirm, user.password)) {
      user.email = req.body.newEmail; req.user.email = req.body.newEmail;
      otp = Math.floor(Math.random() * 999999) + 100000;
      user.isValidated = false; req.user.isValidated = false;
      user.OTP = otp; req.user.OTP = otp;
      console.log(otp);
      req.session.user = req.user;
      user.save();

      let mailOptions = {
          from: 'verifycourseonline@gmail.com',
          to: req.body.newEmail,
          subject: 'You have change your email successfully!',
          html: '<h3>Here is you OTP code: <strong style="font-size: 15px;">' + otp + '</strong></h3>',
      }
      transporter.sendMail(mailOptions, function (err, data) {
          if (err) console.log(err);
      })

      res.redirect('/register/OTP');
    } else {
      req.flash( 'message', {
        icon: 'error',
        title: 'Cập nhật thất bại...',
        text: 'Mật khẩu đã nhập không chính xác!'
      } );
      res.redirect("/profile");
    }
  } else {
    req.flash( 'message', {
      icon: 'error',
      title: 'Cập nhật thất bại...',
      text: 'Địa chỉ email đã tồn tại!'
    } );
    res.redirect("/profile");
  }
});

module.exports = router;