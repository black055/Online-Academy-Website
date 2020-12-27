const express = require('express');
const router = express.Router();
const courseModel = require('../../models/courses.model');
const categoryModel = require('../../models/category.model');
const userModel = require('../../models/user.model');
const teacherModel = require('../../models/teacher.model')

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
    res.render('admin/courseManagement', { layout: 'admin', isCourseManagement: 'true' });
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

module.exports = router;