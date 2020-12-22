const {User} = require('../utils/db');

module.exports = {
    async getUser(id) {
        console.log(id);
        return await User.findById(id);
    }, 

    async addCourse(id_user, courses) {
        return await User.findOneAndUpdate({_id: id_user}, {courses: courses});
    }
}