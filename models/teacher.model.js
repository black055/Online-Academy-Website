const { Teacher, Course } = require('../utils/db');
const { getCourses } = require('./user.model');

module.exports = {
    async getTeacher(id) {
        return await Teacher.findById(id);
    },

    async getTeacherByEmail(email) {
        return await Teacher.findOne( {"email" : `${email}`} );
    },

    async getAllTeachers () {
        return await Teacher.find();
    },

    getCoursesCreated(id) {
        return new Promise(async function(resolve, reject) {
            result = await Course.find({ teacher: id })
            resolve(result);
        })
    }
}