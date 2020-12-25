const {Course} = require('../utils/db');
const categoryModel = require('./category.model');
const userModel = require('./user.model');

module.exports = {
    async getAllCourses() {
        return await Course.find();
    },

    async getCourse(id) {
        return await Course.findById(id);
    },

    getCoursesByCategory(category) {
        return new Promise( async (resolve, reject) => {
            if (typeof category.parent === 'undefined') {
                subcategories = await categoryModel.getSubCategories(category.name);
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
                //console.log(Object.keys(allUser[i].courses[j]), id_course.toString(), Object.keys(allUser[i].courses[j]).indexOf(id_course.toString()));
                if (Object.keys(allUser[i].courses[j]).indexOf(id_course.toString()) > -1){
                    count++;
                    break;
                }
            }
        }
        return count;
    }
}