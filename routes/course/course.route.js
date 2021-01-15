const express = require('express');
const multer = require('multer');
const router = express.Router();
const { Course } = require('../../utils/db');
const fs = require('fs');
const mkdirp = require('mkdirp')
const categoryModel = require('../../models/category.model')
const courseModel = require('../../models/courses.model');

router.get('/', (req, res) => {
    //nothing here
    res.render('index');
});


router.get('/create', async (req, res) => {
    const data = await categoryModel.getAllCategories();
    req.session.referer = req.headers.referer
    res.render('course/create_course', {
        categoryList: data,
    });
});

router.post('/add_course', async (req, res) => {
    const random_key = Math.floor(Math.random() * 999999) + 100000;

    let new_course = new Course({
        name: random_key,
        category: '',
        chapters: [],
        rate: [0,0,0,0,0],
        price: '',
        teacher: '',
        students: 0,
        description: '',
        briefDes: '',
        isFinished: false,
        views: 0,
        saleOff: 0,
        thumbnail: '',
        commands: [],
        target: '',
        soldInWeek: 0,
        lastModified: new Date(),
        createdDate: new Date(),
        require: '',
        purpose: ''
    });
    await new_course.save();

    const course = await Course.findOne({ name: random_key });

    const storage = multer.diskStorage({
        destination: async function (req, file, cb) {
            if (file.fieldname == 'chapter') {
                if (file.mimetype.includes('video/')) {
                    //Lưu chapter
                    course.chapters.push({
                        title: '',
                        video: `/video/${course._id.toString()}/${file.originalname}`
                    })
                    const path = `./public/video/${course._id.toString()}/`;
                    if (!fs.existsSync(path)) {
                        await mkdirp(path, function (err) {
                            if (err) {
                            }
                            else {
                                cb(null, path)
                            }
                        })
                    } else cb(null, path);
                }
            }
            else if (file.fieldname == 'thumbnail') {
                if (file.mimetype.includes('image/')) {
                    //Lưu địa chỉ file thumbnail
                    course.thumbnail = `/images/courses_thumbnail/${file.originalname}`;

                    cb(null, './public/images/courses_thumbnail/')
                }
            }
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })

    const upload = multer({ storage });
    await upload.fields([{
        name: 'thumbnail',
        maxCount: 1
    }, {
        name: 'chapter',
        maxCount: 20
    }])(req, res, async function (err) {
        if (err) {
            console.log(err)
        }
        else {
            course.name = req.body.name;
            course.category = req.body.category;
            course.briefDes = req.body.briefDes;
            course.description = req.body.description;
            course.price = req.body.price;
            course.require = req.body.require;
            course.purpose = req.body.purpose;
            course.saleOff = (req.body.saleOff > 0) ? req.body.price - req.body.price * req.body.saleOff / 100 : 0;
            course.teacher = req.session.user._id.toString();
            course.isFinished = req.body.isFinished ? true : false;

            const chapter_title = req.body.chapter_title;
            if (typeof chapter_title == 'string') {
                course.chapters[0].title = chapter_title
            } else if (chapter_title) {
                for (let i = 0; i < chapter_title.length; i++)
                    if (!course.chapters[i].title)
                        course.chapters[i].title = chapter_title[i] ? chapter_title[i] : '';
            }

            await course.save();
            res.redirect(req.session.referer);
        }
    })
})

router.post('/update/:id', async (req, res) => {
    const prevPage = req.session.referer;
    const course = await courseModel.getCourse(req.params.id);

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname == 'chapter') {
                if (file.mimetype.includes('video/')) {
                    //Lưu chapter
                    course.chapters.push({
                        title: '',
                        video: `/video/${course._id.toString()}/${file.originalname}`
                    })
                    const path = `./public/video/${course._id.toString()}/`;
                    if (!fs.existsSync(path)) {
                        mkdirp(path, function (err) {
                            if (err) {}
                            else {cb(null, path)}
                        })
                    } else cb(null, path);
                }
            }
            else if (file.fieldname == 'thumbnail') {
                if (file.mimetype.includes('image/')) {

                    //Xóa thumbnail cũ
                    if (course.thumbnail !== '' && course.thumbnail !== '/')
                        fs.unlinkSync('./public' + course.thumbnail);

                    //Lưu địa chỉ file thumbnail
                    course.thumbnail = `/images/courses_thumbnail/${file.originalname}`;

                    cb(null, './public/images/courses_thumbnail/')
                }
            }
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })

    const upload = multer({ storage });
    await upload.fields([{
        name: 'thumbnail',
        maxCount: 1
    }, {
        name: 'chapter',
        maxCount: 20
    }])(req, res, async function (err) {
        if (err) {
            console.log(err)
        }
        else {
            course.name = req.body.name;
            course.price = req.body.price;
            course.briefDes = req.body.briefDes;
            course.category = req.body.category;
            course.require = req.body.require;
            course.purpose = req.body.purpose;
            course.description = req.body.description;
            course.isFinished = req.body.isFinished ? true : false;
            course.saleOff = (req.body.saleOff > 0) ? req.body.price - req.body.price * req.body.saleOff / 100 : 0;
            course.lastModified = new Date();

            const chapter_title = req.body.chapter_title;
            if (typeof chapter_title == 'string') {
                course.chapters[0].title = chapter_title
            } else if (chapter_title) {
                for (let i = 0; i < chapter_title.length; i++)
                    if (course.chapters[i])
                        course.chapters[i].title = chapter_title[i] ? chapter_title[i] : '';
            }

            courseModel.updateCourse(course._id.toString(), course, (err, rs) => {if (err) console.log(err)});
            res.redirect(prevPage);
        }
    })
})

router.get('/edit/:id', async (req, res) => {
    const course = await courseModel.getCourse(req.params.id);
    if (course.teacher !== req.user._id) {
        req.flash('err_IDCourse', 'Bạn truy cập vào đường dẫn không hợp lệ')
        res.redirect('/profile');
    }
    const data = await categoryModel.getAllCategories();
    req.session.referer = req.headers.referer
    res.render('course/edit', { course: course, categoryList: data });
});

module.exports = router;