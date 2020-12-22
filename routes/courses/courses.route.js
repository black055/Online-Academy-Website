const express = require('express');
const { clearConfigCache } = require('prettier');
const router = express.Router();
const courseModel = require('../../models/courses.model');
const userModel = require('../../models/user.model');

router.get('/', async (req, res) => {
    const allCourses = await courseModel.getAllCourses();
    res.render('courses/courses', {isCourses: true, allCourses: allCourses});
});


router.get('/register/:id', async (req, res) => {
    if (typeof req.user == 'undefined') {
        res.redirect('/login');
    } else {
        const student = await userModel.getUser(req.user._id);
        let courses = student.courses;
        courses.push(req.params.id);
        await userModel.addCourse(req.user._id, courses);
        res.redirect(`/courses/${req.params.id}`);
    }
});

router.get('/:id', async (req, res) => {
    const course = await courseModel.getCourse(req.params.id);
    let isRegistered = false;
    if (typeof req.user !== 'undefined') {
        if (req.user.courses.includes(course._id.toString()))
        isRegistered = true;
    }
    res.render('courses/course', {course: course, registered: isRegistered});
});



module.exports = router;