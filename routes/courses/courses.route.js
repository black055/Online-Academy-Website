const express = require('express');
const router = express.Router();
const {Course} = require('../../utils/db');

router.get('/', async (req, res) => {
    const allCourses = await Course.find();
    //console.log(allCourses);
    res.render('courses/courses', {isCourses: true, allCourses: allCourses});
});

module.exports = router;