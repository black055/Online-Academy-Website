const {Teacher} = require('../utils/db');

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
}