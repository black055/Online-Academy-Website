const {User, Course} = require('../utils/db');

module.exports = {
    async getUser(id) {
        return await User.findById(id);
    }, 

    async addCourse(id_user, courses) {
        return await User.findOneAndUpdate({_id: id_user}, {courses: courses});
    },

    getCourses(id) {
        return new Promise(async function(resolve, reject) {
            user = await User.findById(id);
            result = [];
            if (user != null) {
                for (i = 0; i < user.courses.length; i++) {
                    course = await Course.findById(user.courses[i]);
                    result.push(course);
                }
            }
            resolve(result);
        })
    },

    getTotalMoney(id) {
        return new Promise(async function(resolve, reject) {
            user = await User.findById(id);
            result = 0;
            if (user != null) {
                for (i = 0; i < user.courses.length; i++) {
                    course = await Course.findById(user.courses[i]);
                    result = result + course.price;
                }
            }
            resolve(result);
        })
    },

    async updateRate (id, courses) {
        return await User.findOneAndUpdate({_id: id}, {courses: courses})
    }
}