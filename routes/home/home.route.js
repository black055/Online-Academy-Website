const express = require('express');
const router = express.Router();
const coursesModel = require('../../models/courses.model');
const teacherModel = require('../../models/teacher.model');
const userModel = require('../../models/user.model');
const categoryModel = require('../../models/category.model');
const mdwIsValidated = require('../../middlewares/validation.mdw');

router.get('/', mdwIsValidated, async (req, res) => {
    const allCourses = await coursesModel.getAllCourses();
    const countStudent = await userModel.count();
    const countTeacher = await teacherModel.count();
  
    counter = {
      "courses": allCourses.length,
      "student": countStudent,
      "teacher": countTeacher
    }
  
    for (course of allCourses) {
      if (course.teacher != '') {
        course.teacher = await teacherModel.getTeacher(course.teacher);
      }
    }
    // 3 khóa học nổi bật
    let bestSeller = allCourses.sort(function (course_1, course_2) {
        return course_2.soldInWeek - course_1.soldInWeek;
    });
    bestSeller = bestSeller.slice(0,3);
  
    // 10 khóa học có mới nhất
    newestCourses = allCourses.sort(function (course_1, course_2) {
      return course_2.createdDate - course_1.createdDate;
    });
    
    newestCourses = newestCourses.slice(0, 10);
  
    // 10 khóa học có nhiều view nhất
    mostViewCourse = allCourses.sort(function (course_1, course_2) {
      return course_2.views - course_1.views;
    });
    mostViewCourse = mostViewCourse.slice(0, 10);
  
    // 4 lĩnh vực bán chạy nhất
    bestSellerCategories = await categoryModel.getBestSellerCategories()
    
    return res.render("index", { isHome: true, bestSeller: bestSeller, newestCourses: newestCourses,
      mostViewCourse: mostViewCourse, counter: counter, bestSellerCategories: bestSellerCategories});
});

module.exports = router;