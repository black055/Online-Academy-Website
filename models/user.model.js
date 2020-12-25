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
                    course = await Course.findById(Object.keys(user.courses[i])[0]);
                    result.push(course);
                }
            }
            resolve(result);
        })
    },

    getWatchlist(id) {
        return new Promise(async function(resolve, reject) {
            user = await User.findById(id);
            result = [];
            if (user != null) {
                for (i = 0; i < user.watchlist.length; i++) {
                    course = await Course.findById(Object.keys(user.watchlist[i])[0]);
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
                    course = await Course.findById(Object.keys(user.courses[i])[0]);
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