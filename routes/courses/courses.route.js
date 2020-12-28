const express = require('express');
const router = express.Router();
const coursesModel = require('../../models/courses.model');
const userModel = require('../../models/user.model');

router.get('/', async (req, res) => {
    const allCourses = await coursesModel.getAllCourses();
    let arrStudent = [];
    let count = 0;
    for (let i = 0; i < allCourses.length; i++) {
        count = await coursesModel.getNumberOfStudent(allCourses[i]._id);
        arrStudent.push(count);
    }

    // Get 3 courses which have most number of students
    let cloneArrCourses = [...allCourses];
    let mostCourses = cloneArrCourses.sort(function (course_1, course_2) {
        return course_2.students - course_1.students;
    });

    mostCourses = mostCourses.slice(0,3);

    // Get 3 newest courses
    cloneArrCourses.sort(function (course_1, course_2) {
        return course_1.createdDate - course_2.createdDate;
    });

    let newestCourses = cloneArrCourses.length >= 3 ? cloneArrCourses.slice(0,3) : cloneArrCourses;

    res.render('courses/courses', {isCourses: true, allCourses: allCourses, newestCourses: newestCourses, mostCourses: mostCourses});
});

router.get('/rate/:id_course/:value', async (req, res) => {
    let user = await userModel.getUser(req.user._id);
    let course = await coursesModel.getCourse(req.params.id_course);
    let arrRate = [];
    for(let index = 0; index < req.user.courses.length; index++) {
        if (Object.keys(req.user.courses[index])[0] == req.params.id_course.toString())
        {
            if (user.courses[index][req.params.id_course].rate != 0) {
                course.rate[user.courses[index][req.params.id_course].rate - 1] -= 1;
                course.rate[req.params.value - 1] += 1;
                arrRate = course.rate;
                await coursesModel.updateRate(req.params.id_course, arrRate);
                course = await coursesModel.getCourse(req.params.id_course);
                course.save();
            } else {
                course.rate[req.params.value - 1] += 1
                arrRate = course.rate;
                await coursesModel.updateRate(req.params.id_course, arrRate);
                course = await coursesModel.getCourse(req.params.id_course);
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
        let courseReg = await coursesModel.getCourse(req.params.id);
        courseReg.students += 1;
        courseReg.save();
        let courses = student.courses;

        let cart = [];
        cart = student.cart;
        const course = {};
        course[req.params.id] = {rate: 0};
        courses.push(course);
        if (cart.includes(req.params.id))
            cart = cart.filter(course => course.toString() != req.params.id);
        await userModel.addCourse(req.user._id, courses);
        await userModel.addCart(req.user._id, cart);
        student = await userModel.getUser(req.user._id);
        student.save(function(err) {
            if (err) console.log(err);
            req.session.user = student;
            req.logIn(student, function(e) {
                if (e) console.log(e);
                res.redirect(`/courses/${req.params.id}`);
            })
        });
    }
});

router.get('/addTocart/:id_course', async (req, res) => {
    if(req.user) {
        let user = await userModel.getUser(req.user._id);
        let cart = user.cart;
        const course = await coursesModel.getCourse(req.params.id_course);
        if (!cart.includes(course._id))
            cart.push(course._id);
        await userModel.addCart(user._id, cart);
        user = await userModel.getUser(req.user._id);
        user.save(function(err) {
            if (err) console.log(err);
            req.session.user = user;
            req.logIn(user, async function (e) {
                if (e) console.log(e);
                let coursesInCart = [];
                for (let index = 0; index < user.cart.length; index++) {
                    let course = await coursesModel.getCourse(user.cart[index]);
                    coursesInCart.push(course);
                }
                res.send(coursesInCart);
            })
        })
    } else {
        req.session.cart = typeof req.session.cart === 'undefined' ? [] : req.session.cart;
        if (!req.session.cart.includes(req.params.id_course))
            req.session.cart.push(req.params.id_course);
        let cart = [];
        for (let index = 0; index < req.session.cart.length; index++) {
            let course = await coursesModel.getCourse(req.session.cart[index]);
            cart.push(course);
        }
        res.send(cart);
    };
});

router.get('/removeFromCart/:id_course', async (req, res) => {
    if(req.user) {
        let user = await userModel.getUser(req.user._id);
        let cart = user.cart;
        const course = await coursesModel.getCourse(req.params.id_course);
        if (cart.includes(course._id))
            cart = cart.filter(course => course.toString() != req.params.id_course);
        await userModel.addCart(user._id, cart);
        user = await userModel.getUser(req.user._id);
        user.save(function(err) {
            if (err) console.log(err);
            req.session.user = user;
            req.logIn(user, async function (e) {
                if (e) console.log(e);
                let coursesInCart = [];
                for (let index = 0; index < user.cart.length; index++) {
                    let course = await coursesModel.getCourse(user.cart[index]);
                    coursesInCart.push(course);
                }
                res.send(coursesInCart);
            })
        })
    } else {
        req.session.cart = typeof req.session.cart === 'undefined' ? [] : req.session.cart;
        if (req.session.cart.includes(req.params.id_course))
            req.session.cart = req.session.cart.filter(id_course => id_course != req.params.id_course);
        let cart = [];
        for (let index = 0; index < req.session.cart.length; index++) {
            let course = await coursesModel.getCourse(req.session.cart[index]);
            cart.push(course);
        }
        res.send(cart);
    };
})

router.get('/:id_course/:id_lecture', async (req, res) => {
    const course = await coursesModel.getCourse(req.params.id_course);
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
    const course = await coursesModel.getCourse(req.params.id_course);
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