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

router.get('/rate/:id_course/:value', async (req, res) => {
    let user = await userModel.getUser(req.user._id);
    for(let index = 0; index < req.user.courses.length; index++) {
        if (Object.keys(req.user.courses[index])[0] == req.params.id_course.toString())
        {
            user.courses[index][req.params.id_course].rate = req.params.value;
            await userModel.updateRate(req.user._id, user.courses);
            user = await userModel.getUser(req.user._id);
            user.save(function(err) {
                if (err) console.log(err);
                req.logIn(user, function(e) {
                    if (e) console.log(e);
                    res.send(`Bạn đã đánh giá khóa học này ${req.params.value} sao`);
                })
            });
            break;
        }
    }
})

router.get('/register/:id', async (req, res) => {
    if (typeof req.user == 'undefined') {
        res.redirect('/login');
    } else {
        let student = await userModel.getUser(req.user._id);
        let courses = student.courses;

        const course = {};
        course[req.params.id] = {rate: 0};
        courses.push(course);
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
    const title = course.chapters[Number(req.params.id_lecture)].title;
    res.render('courses/chapter', {course: course, url: url, title: title});
})

router.get('/:id_course', async (req, res) => {
    const course = await courseModel.getCourse(req.params.id_course);
    let isRegistered = false;
    let rate = 0;
    if (typeof req.user !== 'undefined') {
        for(let index = 0; index < req.user.courses.length; index++) {
            if (Object.keys(req.user.courses[index])[0] == course._id.toString())
            {
                rate = req.user.courses[index][req.params.id_course].rate;
                isRegistered = true;
                break;
            }
        }
    }
    res.render('courses/course', {course: course, registered: isRegistered, rate: rate});
});



module.exports = router;