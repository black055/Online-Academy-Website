const {Course} = require('../utils/db');

module.exports = {
    async getAllCourses() {
        return await Course.find();
    },

    async getCourse(id) {
        return await Course.findById(id);
    }
}