const express = require('express');
const router = express.Router();
const courseModel = require('../../models/courses.model');
const categoryModel = require('../../models/category.model');
const userModel = require('../../models/user.model');
const teacherModel = require('../../models/teacher.model');
const mailer = require('nodemailer');
const bcrypt = require('bcrypt');
const randomString = require('random-string');
const {Teacher} = require('../../utils/db');

const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'verifycourseonline@gmail.com',
        pass: '22102000shch',
    }
});

router.get('/', async (req, res) => {
    res.render('index', { layout: 'admin', isHome: 'true' });
});

router.get('/categoryManagement', async (req, res) => {
    const message = req.flash('message');
    if (typeof message === 'undefined')
        res.render('admin/categoryManagement', { layout: 'admin', isCategoryManagement: 'true' });
    else
        res.render('admin/categoryManagement', { layout: 'admin', isCategoryManagement: 'true', message: message });
});

router.get('/courseManagement', async (req, res) => {
    courses = await courseModel.getAllCoursesJSON();
    for (course of courses) {
        if (course.teacher != '') {
            teacher = await teacherModel.getTeacher(course.teacher);
            courses.teacher = {
                'id': teacher._id,
                'name': teacher.name,
            };
        }
    }
    res.render('admin/courseManagement', { layout: 'admin', isCourseManagement: 'true', courses: courses });
});

router.get('/userManagement', async (req, res) => {
    users = await userModel.getAllUser();
    teachers = await teacherModel.getAllTeachers();
    const message = req.flash('message');
    if (typeof message === 'undefined')
        res.render('admin/userManagement', { layout: 'admin', isUserManagement: 'true',
            users: users, teachers: teachers });
    else
        res.render('admin/userManagement', { layout: 'admin', isUserManagement: 'true', message: message,
            users: users, teachers: teachers });
    
});

router.post('/categoryManagement/add', async (req, res) => {
    category = await categoryModel.getCategory(req.body.name);
    if (category == null) {
        await categoryModel.addCategory(req.body.name, req.body.rdParent);
    }
    req.flash('message', {
        icon: 'success',
        title: 'Thêm lĩnh vực thành công!',
        text: 'Đã thêm lĩnh vực vào cơ sở dữ liệu!'
      } );
    res.redirect('/admin/categoryManagement');
});

router.post('/categoryManagement/edit', async (req, res) => {
    category = await categoryModel.getCategory(req.body.oldName);
    if (category != null) {
        if (req.body.oldName != req.body.newName) {
            courses = await courseModel.getCoursesByCategory(category);
            for (course of courses) {
                course.category = req.body.name;
                course.save();
            }
            category.name = req.body.name;
        }
        if (req.body.newParent == null) category.parent = 'null';
        else category.parent = req.body.newParent;
        category.save();
    }
    req.flash('message', {
        icon: 'success',
        title: 'Chỉnh sửa thành công!',
        text: 'Chỉnh sửa thông tin lĩnh vực thành công!'
      } );
    res.redirect('/admin/categoryManagement');
});

router.post('/categoryManagement/remove', async (req, res) => {
    category = await categoryModel.getCategory(req.body.name);
    courses = await courseModel.getCoursesByCategory(category);
    // Kiểm tra có khóa học thuộc lĩnh vực này không?
    if (courses.length > 0) {
        req.flash( 'message', {
            icon: 'error',
            title: 'Xóa lĩnh vực thất bại...',
            text: 'Không thể xóa lĩnh vực đã tồn tại khóa học!'
          } );
    } else {
        await categoryModel.removeCategory(category);
        req.flash('message', {
            icon: 'success',
            title: 'Xóa lĩnh vực thành công!',
            text: 'Đã xóa lĩnh vực ra khỏi cơ sở dữ liệu!'
          } );
    }

    res.redirect('/admin/categoryManagement');
});

router.post('/userManagement/edit', async (req, res) => {
    if (req.body.userType == "Student") user = await userModel.getUser(req.body.id);
    else if (req.body.userType == "Teacher") user = await teacherModel.getTeacher(req.body.id);
    user.name = req.body.name;
    user.bthday = req.body.bthday;
    user.gender = req.body.gender;
    user.phone = req.body.phone;
    await user.save();
    req.flash('message', {
        icon: 'success',
        title: 'Cập nhật thành công!',
        text: 'Cập nhật thông tin của người dùng thành công!'
    } );

    res.redirect('/admin/userManagement');
});

router.post('/userManagement/add', async (req, res) => {
    password = randomString({ length: 8, numeric: true, letters: true, special: false, });
    password += Math.floor(Math.random() * 9);
    
    const hash = await bcrypt.hashSync(password, 10, (err, hash) => {
        if (err) {
            console.log(err);
        }
    });
    newTeacher = new Teacher({
        email: req.body.email, 
        name: req.body.name,
        bthday: req.body.bthday,
        password: hash,
        courses: [],
        userType: 'Teacher',
        phone: req.body.phone,
        gender: req.body.gender,
    });
    newTeacher.save();
    console.log('Email: ' + req.body.email);
    console.log('Password: ' + password);

    let mailOptions = {
        from: 'verifycourseonline@gmail.com',
        to: req.body.email,
        subject: 'Welcome to our website',
        html: `You have register as a teacher at our website. Here is your account infomation: <br>
        Username: ${req.body.email} <br>
        Password: ${password}`,
    }
    transporter.sendMail(mailOptions, function (err, data) {
        if (err) console.log(err);
    });

    req.flash('message', {
        icon: 'success',
        title: 'Thêm giáo viên thành công!',
        text: 'Thêm giáo viên vào cơ sở dữ liệu thành công!'
    } );

    res.redirect('/admin/userManagement');
});

module.exports = router;