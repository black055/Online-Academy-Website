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

    async removeTeacher(id) {
        await Teacher.deleteOne( {"_id" : `${id}`} );
        return true;
    },
    
    getCoursesCreated(id) {
        return new Promise(async function(resolve, reject) {
            result = await Course.find({ teacher: id })
            resolve(result);
        })
    },

    async count() {
        return await Teacher.countDocuments();
    }
}