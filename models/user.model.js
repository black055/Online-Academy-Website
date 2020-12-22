const {User} = require('../utils/db');

module.exports = {
    async getUser(id) {
        return await User.findById(id);
    }, 

    async addCourse(id_user, courses) {
        return await User.findOneAndUpdate({_id: id_user}, {courses: courses});
    },

    getTotalMoney(id) {
        return new Promise(async function(resolve, reject) {
            user = await User.findById(id);
            result = 0;
            if (user != null) {
                for (i = 0; i < user.courses.length; i++) {
                    result = result + user.courses[i].price
                }
            }
            resolve(result);
        })
    }
}