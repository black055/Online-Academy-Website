const express = require('express');
const { clearConfigCache } = require('prettier');
const router = express.Router();
const courseModel = require('../../models/courses.model');
const userModel = require('../../models/user.model');
const categoryModel = require('../../models/category.model')

router.get('/', async (req, res) => {
    const allCourses = await courseModel.getAllCourses();
    res.render('courses/courses', {isCourses: true, allCourses: allCourses});
});

router.get('/category/:id', async (req, res) => {
    const category = await categoryModel.getCategory(req.params.id);
    const coursesList = await courseModel.getCoursesByCategory(category);
    res.render('courses/courses', {isCourses: true, allCourses: coursesList});
});

// router.get('/lectures', async (req, res) => {
//     res.render('courses/chapter');
// })

router.get('/register/:id', async (req, res) => {
    if (typeof req.user == 'undefined') {
        res.redirect('/login');
    } else {
        let student = await userModel.getUser(req.user._id);
        let courses = student.courses;
        courses.push(req.params.id);
        await userModel.addCourse(req.user._id, courses);
        student = await userModel.getUser(req.user._id);
        student.save(function(err) {
            if (err) console.log(err);
            req.logIn(student, function(e) {
                if (e) console.log(e);
                res.redirect(`/courses/${req.params.id}`);
            })
        });
    }
});

router.get('/:id_course/:id_lecture', async (req, res) => {
    const course = await courseModel.getCourse(req.params.id_course);
    const url = course.chapters[Number(req.params.id_lecture)].video;
    res.render('courses/chapter', {course: course, url: url});
})

router.get('/:id_course', async (req, res) => {
    const course = await courseModel.getCourse(req.params.id_course);
    let isRegistered = false;
    if (typeof req.user !== 'undefined') {
        if (req.user.courses.includes(course._id.toString()))
        {
            isRegistered = true;
        }
    }
    res.render('courses/course', {course: course, registered: isRegistered});
});



module.exports = router;