const {Course, Category} = require('../utils/db');
const userModel = require('./user.model');

module.exports = {
    async getAllCourses() {
        return await Course.find();
    },

    async getAllCoursesJSON() {
        return await Course.find().lean();
    },

    async getCourse(id) {
        return await Course.findById(id);
    },

    async getCourseOfTeacher(teacherId) {
        return await Course.find( {'teacher': `${teacherId}`} );
    },

    getCoursesByCategory(category) {
        return new Promise( async (resolve, reject) => {
            if (category.parent === 'null') {
                subcategories = await Category.find( {"parent" : `${category.name}`} );
                result= [];
                for (const subcategory of subcategories) {
                    subcourses = await Course.find({ 'category': `${subcategory.name}` });
                    result = result.concat(subcourses);
                }
                resolve(result);
            } else {
                result = await Course.find({ 'category': `${category.name}` });
                resolve(result);
            }
        });
    },

    async updateRate(id_course, arrRate) {
        return await Course.findOneAndUpdate({_id: id_course}, {$set : {'rate': arrRate}});
    },

    async getNumberOfStudent (id_course) {
        const allUser = await userModel.getAllUser();
        let count = 0;
        for(let i = 0; i < allUser.length; i++) {
            for (let j = 0; j < allUser[i].courses.length; j++) {
                if (Object.keys(allUser[i].courses[j]).indexOf(id_course.toString()) > -1){
                    count++;
                    break;
                }
            }
        }
        return count;
    },

    async removeCourse(id) {
        await Course.deleteOne( {"_id" : `${id}`} );
        return true;
    },
    
    async updateCourse(id, course, callback) {
        return await Course.findByIdAndUpdate(id, course, callback);
    },

    async resetSoldInWeek() {
        let arrCourse = await Course.find();
        for (let i = 0; i < arrCourse.length; i++) {
            arrCourse[i].soldInWeek = 0;
            arrCourse[i].save();
        }
    },

    async searchCourses(keyword, category) {
        if (category == 'null') {
            return await Course.find( {$text: {$search: keyword}} );
        } else {
            return await Course.find( {$text: {$search: keyword}, 'category': `${category}`} );
        }
    }
}