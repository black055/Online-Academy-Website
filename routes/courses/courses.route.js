const express = require('express');
const categoryModel = require('../../models/category.model');
const router = express.Router();
const coursesModel = require('../../models/courses.model');
const userModel = require('../../models/user.model');
const teacherModel = require('../../models/teacher.model');

router.get('/', async (req, res) => {
    const allCourses = await coursesModel.getAllCourses();
    let arrStudent = [];
    let count = 0;
    for (let i = 0; i < allCourses.length; i++) {
        count = await coursesModel.getNumberOfStudent(allCourses[i]._id);
        arrStudent.push(count);
        if (allCourses[i].teacher !== '') {
            let teacher = await teacherModel.getTeacher(allCourses[i].teacher)
            allCourses[i].teacherName = teacher.name;
        }
    }

    // Get 3 courses which have most number of students
    let cloneArrCourses = [...allCourses];
    let mostCourses = cloneArrCourses.sort(function (course_1, course_2) {
        return course_2.students - course_1.students;
    });

    mostCourses = mostCourses.slice(0,3);

    // Get 3 newest courses
    cloneArrCourses.sort(function (course_1, course_2) {
        return course_2.createdDate - course_1.createdDate;
    });

    let newestCourses = cloneArrCourses.length >= 3 ? cloneArrCourses.slice(0,3) : cloneArrCourses;

    res.render('courses/courses', {isCourses: true, allCourses: allCourses, newestCourses: newestCourses, mostCourses: mostCourses, title: 'Tất cả khóa học' });
});

router.post('/comment/:id_course', async (req, res) => {
    let user = await userModel.getUser(req.user._id);
    for (let i = 0; i < user.courses.length; i++) {
        if (Object.keys(user.courses[i])[0] == req.params.id_course) {
            let comment = {content: req.body.comment, time: new Date(Date.now())};
            if (typeof user.courses[i][req.params.id_course]["comment"] == "undefined")
                user.courses[i][req.params.id_course]["comment"] = [];
        
            user.courses[i][req.params.id_course]["comment"].push(comment);
            let courses = user.courses;
            await userModel.addComment(req.user._id, courses);
            break;
        }
    }
    user = await userModel.getUser(req.user._id);
    user.save();
    res.redirect(`/courses/${req.params.id_course}`);
});

router.get('/registerAllCourses', async (req, res) => {
    if (typeof req.user == 'undefined') {
        res.redirect('/login');
    } else {
        let student = await userModel.getUser(req.user._id);
        let cart = student.cart;
        let arrCourses = student.courses;
        for (let i = 0; i < cart.length; i++) {
            let course = await coursesModel.getCourse(cart[i]);
            course.students += 1;
            course.soldInWeek += 1;
            course.save();
            categoryModel.updateSoldInWeek(course._id);
            let newCourse = {};
            newCourse[cart[i]] = {rate: 0, comment: []};
            arrCourses.push(newCourse);
        }
        student.courses = arrCourses;
        student.cart = [];
        student.save();
        req.logIn(student, function(err) {
            console.log(err);
        });
        res.redirect('/');
    }
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
        courseReg.soldInWeek += 1;
        courseReg.save();
        categoryModel.updateSoldInWeek(req.params.id);
        let courses = student.courses;

        let cart = [];
        cart = student.cart;
        const course = {};
        course[req.params.id] = {rate: 0, comment: []};
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

router.get('/addToWatchList/:id_course', async (req, res) => {
    let user = await userModel.getUser(req.user._id);
    if (!user.watchList.includes(req.params.id_course))
    {
        user.watchList.push(req.params.id_course);
        user.save();
        req.logIn(user, function(err) {
            console.log(err);
        });
        res.send(true);
    } else res.send(false);
});

router.get('/removeFromWatchList/:id_course', async (req, res) => {
    let user = await userModel.getUser(req.user._id);
    if (user.watchList.includes(req.params.id_course))
    {
        user.watchList = user.watchList.filter(course => course.toString() != req.params.id_course);
        user.save();
        req.logIn(user, function(err) {console.log(err)})
        req.flash('message', {
            icon: 'success',
            title: 'Thành công!',
            text: 'Xóa khóa học ra khỏi danh sách khóa học yêu thích!'
          } );
    } else {
        req.flash( 'message', {
            icon: 'error',
            title: 'Thất bại...',
            text: 'Có lỗi xảy ra khi xóa khóa học ra khỏi danh sách!'
          } );
    }
    res.redirect('/profile');
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

router.post('/search', async (req, res) => {
    result = await coursesModel.searchCourses(req.body.keyword, req.body.category);
    res.render('courses/courses', {allCourses: result, title: `Kết quả cho: ${req.body.keyword}`});
});

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
    let allComments = [];
    let allUser = await userModel.getAllUser();
    for (let i = 0; i < allUser.length; i++) {
        for (let j = 0; j < allUser[i].courses.length; j++) {
            if (Object.keys(allUser[i].courses[j])[0] == req.params.id_course) {
                if (typeof allUser[i].courses[j][req.params.id_course]["comment"] != 'undefined') {
                    for (let k = 0; k < allUser[i].courses[j][req.params.id_course]["comment"].length; k++) {
                        let item = {
                            name: allUser[i].name, 
                            rate: allUser[i].courses[j][req.params.id_course]["rate"], 
                            content: allUser[i].courses[j][req.params.id_course]["comment"][k]}

                        allComments = [...allComments, item];
                    }
                }
            }
        }
    }

    for (let i = 0; i < arrRate.length; i++) {
        courseRate += arrRate[i]*(i+1);
        sumRate += arrRate[i]*5;
    };
    course.views += 1;
    course.save();
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
    let cat = await categoryModel.getCategory(course.category);
    let sameCourses = await coursesModel.getCoursesByCategory(cat);
    let temp = [];
    for (let i = 0; i < sameCourses.length; i++) {
        if (sameCourses[i]._id.toString() != course._id.toString())
            temp.push(sameCourses[i]);
    }
    sameCourses = [...temp];
    sameCourses = sameCourses.length < 5 ? sameCourses : sameCourses.slice(0, 5);
    courseRate = isNaN(Number.parseFloat(courseRate).toFixed(1)) ? 0 : Number.parseFloat(courseRate).toFixed(1);
    res.render('courses/course', {
        course: course, 
        registered: isRegistered, 
        rate: rate, 
        courseRate: courseRate,
        totalRate: sumRate / 5,
        comments: allComments,
        sameCourses: sameCourses,
    });
});

module.exports = router;