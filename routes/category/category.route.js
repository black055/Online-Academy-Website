const express = require('express');
const router = express.Router();
const courseModel = require('../../models/courses.model');
const categoryModel = require('../../models/category.model')

router.get('/:id', async (req, res) => {
    const category = await categoryModel.getCategory(req.params.id);
    const coursesList = await courseModel.getCoursesByCategory(category);
    res.render('courses/courses', {isCategories: true, allCourses: coursesList });
});

module.exports = router;