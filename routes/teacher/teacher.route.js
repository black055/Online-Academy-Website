const express = require('express');
const multer = require('multer');
const router = express.Router();
const { Course } = require('../../utils/db');
const fs = require('fs');
const mkdirp = require('mkdirp')

router.get('/', (req, res) => {
    //nothing here
    res.redirect('/');
});


router.get('/upload_course', async (req, res) => {
    const data = await Course.find({ "tags": { $ne: null } });
    let tags = [];
    data.forEach((e) => {
        if (e['tags'].length) tags.push(e['tags'].length)
    })
    tags = [...new Set(tags)];
    if (!tags.length)
        tags = null;
    res.render('teacher/teacher', {
        categoryList: tags,
    });
});

router.post('/add_course', async (req, res) => {
    let course = new Course({
        name: '',
        tags: [],
        group: '',
        chapters: [],
        rate: [],
        rating: 0,
        price: '',
        teacher: '',
        students: 0,
        comments: [],
        description: '',
        tinyDes: '',
        views: 0,
        saleOff: 0,
        avatar: '',
        isFinished: '',
    });

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname == 'chapter') {
                if (file.mimetype.includes('video/')) {
                    const course_name = encodeURI(req.body.name);

                    //TODO: Đổi course_name = id
                    //Lưu chapter
                    course.chapters.push({
                        title: '',
                        video: `/video/${course_name}/${file.originalname}`
                    })
                    const path = `./public/video/${course_name}/`;
                    if (!fs.existsSync(path)) {
                        mkdirp(path, function (err) {
                            if (err) {
                            }
                            else {
                                cb(null, path)
                            }
                        })
                    } else cb(null, path);
                }
            }
            else if (file.fieldname == 'avatar') {
                if (file.mimetype.includes('image/')) {

                    //Lưu địa chỉ file thumbnail
                    course.avatar = `/images/courses_avatar/${file.originalname}`;

                    cb(null, './public/images/courses_avatar/')
                }
            }
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })

    const upload = multer({ storage });
    await upload.fields([{
        name: 'avatar',
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
            course.tinyDes = req.body.tinyDes;
            course.description = req.body.description;
            course.group = '';
            course.price = req.body.price;
            course.isFinished = req.body.isFinished ? true : false;

            const chapter_title = req.body.chapter_title;
            if (typeof chapter_title == 'string') {
                course.chapters[0].title = chapter_title
            } else if (chapter_title) {
                for (let i = 0; i < chapter_title.length; i++)
                    if (!course.chapters[i].title)
                        course.chapters[i].title = chapter_title[i] ? chapter_title[i] : '';
            }

            //TODO: Hiện progress loading cho user
            //console.log(course)
            await course.save();
            res.redirect('/');
        }
    })

})

module.exports = router;