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
            result = await Course.find({ "category": `${category.name}` });
            if (category.parent === 'null') {
                subcategories = await Category.find( {"parent" : `${category.name}`} );
                for (const subcategory of subcategories) {
                    subcourses = await Course.find({ "category": `${subcategory.name}` });
                    result = result.concat(subcourses);
                }
                resolve(result);
            }
            resolve(result);
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
            result = await Course.find( {$text: {$search: keyword}});
        } else {
            result = await Course.find( {$text: {$search: keyword}, 'category': `${category}`} );
            subCategories = await Category.find({ 'parent': `${category}` });
            for (subCategory of subCategories) {
                result = result.concat(await Course.find( {$text: {$search: keyword}, 'category': `${subCategory.name}`} ));
            }
        }
        return result;
    }, 

    async bestSeller() {
        let courses = await Course.find();
        courses = courses.filter( course => course.students > 0 );
        return courses.sort((course_1, course_2) => course_2.students - course_1.students).slice(0,10);
    },

    async getNewest() {
        let courses = await Course.find();
        return courses.sort((course_1, course_2) => course_2.createdDate - course_1.createdDate).slice(0,10);
    }, 
    
    async getBestSeller() {
        let courses = await Course.find();
        return courses.sort((course_1, course_2) => course_2.students - course_1.students).slice(0,10);
    }
}