const {Course} = require('../utils/db');
const categoryModel = require('./category.model')

module.exports = {
    async getAllCourses() {
        return await Course.find();
    },

    async getCourse(id) {
        return await Course.findById(id);
    },

    getCoursesByCategory(category) {
        return new Promise( async (resolve, reject) => {
            if (category.parent === 'null') {
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
}