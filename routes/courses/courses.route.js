const express = require('express');
const router = express.Router();
const courseModel = require('../../models/courses.model');
const userModel = require('../../models/user.model');

router.get('/', async (req, res) => {
    const allCourses = await courseModel.getAllCourses();
    let arrStudent = [];
    let count = 0;
    for (let i = 0; i < allCourses.length; i++) {
        count = await courseModel.getNumberOfStudent(allCourses[i]._id);
        arrStudent.push(count);
    }
    res.render('courses/courses', {isCourses: true, allCourses: allCourses, numStudent: arrStudent});
});

router.get('/rate/:id_course/:value', async (req, res) => {
    let user = await userModel.getUser(req.user._id);
    let course = await courseModel.getCourse(req.params.id_course);
    let arrRate = [];
    for(let index = 0; index < req.user.courses.length; index++) {
        if (Object.keys(req.user.courses[index])[0] == req.params.id_course.toString())
        {
            if (user.courses[index][req.params.id_course].rate != 0) {
                course.rate[user.courses[index][req.params.id_course].rate - 1] -= 1;
                course.rate[req.params.value - 1] += 1;
                arrRate = course.rate;
                await courseModel.updateRate(req.params.id_course, arrRate);
                course = await courseModel.getCourse(req.params.id_course);
                course.save();
            } else {
                course.rate[req.params.value - 1] += 1
                arrRate = course.rate;
                await courseModel.updateRate(req.params.id_course, arrRate);
                course = await courseModel.getCourse(req.params.id_course);
                course.save();
            }
            arrRate = [];
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
});

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

router.post('/closepage/:time', (req, res) => {
    console.log(req.params.time);
})

router.get('/:id_course/:id_lecture', async (req, res) => {
    const course = await courseModel.getCourse(req.params.id_course);
    const url = course.chapters[Number(req.params.id_lecture)].video;
    const title = course.chapters[Number(req.params.id_lecture)].title;
    let isRegistered = false;
    if (typeof req.user !== 'undefined') {
        for(let index = 0; index < req.user.courses.length; index++) {
            if (Object.keys(req.user.courses[index])[0] == course._id.toString())
            {
                isRegistered = true;
                break;
            }
        }
    };
    res.render('courses/chapter', {course: course, url: url, title: title, registered: isRegistered});
})

router.get('/:id_course', async (req, res) => {
    const course = await courseModel.getCourse(req.params.id_course);
    let isRegistered = false;
    let arrRate = course.rate;
    let rate = 0;
    let courseRate = 0;
    let sumRate = 0;
    for (let i = 0; i < arrRate.length; i++) {
        courseRate += arrRate[i]*(i+1);
        sumRate += arrRate[i]*5;
    };
    courseRate = (courseRate / sumRate) * 5;
    if (typeof req.user !== 'undefined') {
        for(let index = 0; index < req.user.courses.length; index++) {
            if (Object.keys(req.user.courses[index])[0] == course._id.toString())
            {
                rate = req.user.courses[index][req.params.id_course].rate;
                isRegistered = true;
                break;
            }
        }
    };
    courseRate = isNaN(Number.parseFloat(courseRate).toFixed(1)) ? 0 : Number.parseFloat(courseRate).toFixed(1);
    res.render('courses/course', {
        course: course, 
        registered: isRegistered, 
        rate: rate, 
        courseRate: courseRate,
        totalRate: sumRate / 5,
    });
});



module.exports = router;