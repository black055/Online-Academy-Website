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
    res.render('index', { isHome: 'true' });
});

router.get('/categoryManagement', async (req, res) => {
    const message = req.flash('message');
    if (typeof message === 'undefined')
        res.render('admin/categoryManagement', { isCategoryManagement: 'true' });
    else
        res.render('admin/categoryManagement', { isCategoryManagement: 'true', message: message });
});

router.get('/courseManagement', async (req, res) => {
    courses = await courseModel.getAllCoursesJSON();
    for (course of courses) {
        if (course.teacher != '') {
            teacher = await teacherModel.getTeacher(course.teacher);
            course.teacher = teacher.name;
        }
    }

    const message = req.flash('message');
    if (typeof message === 'undefined')
        res.render('admin/courseManagement', { isCourseManagement: 'true', courses: courses });
    else res.render('admin/courseManagement', { isCourseManagement: 'true', courses: courses, message: message});
});

router.get('/userManagement', async (req, res) => {
    users = await userModel.getAllUser();
    teachers = await teacherModel.getAllTeachers();
    const message = req.flash('message');
    if (typeof message === 'undefined')
        res.render('admin/userManagement', { isUserManagement: 'true',
            users: users, teachers: teachers });
    else
        res.render('admin/userManagement', { isUserManagement: 'true', message: message,
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

router.post('/courseManagement/remove', async (req, res) => {
    users = await userModel.getAllUser();
    for (user of users) {
        // Xóa khóa học ra khỏi danh sách khóa học đã mua
        for (i = 0; i < user.courses.length; i++) {
            if (Object.keys(user.courses[i])[0] == req.body.id) {
                user.courses.splice(i, 1);
                user.save();
                break;
            }
        }
        // Xóa khóa học ra khỏi danh sách khóa học đang theo dõi
        for (i = 0; i < user.watchList.length; i++) {
            if (Object.keys(user.watchList[i])[0] == req.body.id) {
                user.watchList.splice(i, 1);
                user.save();
                break;
            }
        }
    }
    await courseModel.removeCourse(req.body.id);

    req.flash('message', {
        icon: 'success',
        title: 'Xóa khóa học thành công!',
        text: 'Xóa khóa học ra khỏi cơ sở dữ liệu thành công!'
    } );

    res.redirect('/admin/courseManagement');
});

router.get('/userManagement/setAvailableTeacher/:id', async (req, res) => {
    teacher = await teacherModel.getTeacher(req.params.id);
    if (teacher != null) {
        teacher.isAvailable = !teacher.isAvailable;
        teacher.save();
        res.send(true);
    } else {
        res.send(false);
    }
});

router.get('/userManagement/setAvailableUser/:id', async (req, res) => {
    user = await userModel.getUser(req.params.id);
    if (user != null) {
        user.isAvailable = !user.isAvailable;
        user.save();
        res.send(true);
    } else {
        res.send(false);
    }
});

module.exports = router;