const express = require('express');
const router = express.Router();
const courseModel = require('../../models/courses.model');
const categoryModel = require('../../models/category.model')

router.get('/:category', async (req, res) => {
    const category = await categoryModel.getCategory(req.params.category);
    const coursesList = await courseModel.getCoursesByCategory(category);
    res.render('courses/courses', { isCategories: true, allCourses: coursesList, title: `Lĩnh vực: ${category.name}` });
});

module.exports = router;