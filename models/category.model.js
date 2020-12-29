const {Course, Category} = require('../utils/db');
const coursesModel = require('../models/courses.model');

module.exports = {

    async getMenuCategory() {
        return new Promise(async (resolve, reject) => {
            categories = await Category.find( { "parent" : 'null' }).lean();
            for (i = 0; i < categories.length; i++) {
                subCategory = await Category.find( {"parent" : categories[i].name } ).lean();
                if (typeof subCategory !== 'undefined')
                    categories[i].subCategory = subCategory;
            }
            resolve(categories);
        }).catch(err => {console.log(err);});
    },

    getCategory(name) {
        return Promise.resolve(Category.findOne( {"name" : `${name}`} ));
    },

    getSubCategories(name) {
        return Promise.resolve(Category.find( {"parent" : `${name}`} ));
    },

    async addCategory(name, parent) {
        category = new Category({name: name, parent: parent, courses: '', soldInWeek: 0});
        category.save();
        return true;
    },

    async removeCategory(category) {
        await Category.deleteMany( {"parent" : `${category.name}`} );
        await Category.deleteOne( {"name" : `${category.name}`} );
        return true;
    },

    async updateSoldInWeek(id_course) {
        let course = await coursesModel.getCourse(id_course);
        let arrCat = await Category.find();
        for (let i = 0; i < arrCat.length; i++) {
            if (arrCat[i].name == course.category) {
                arrCat[i].soldInWeek += 1;
                arrCat[i].save();
                if (arrCat[i].parent != null) {
                    let parCat = await this.getCategory(arrCat[i].parent);
                    parCat.soldInWeek += 1;
                    parCat.save();
                }
                console.log(arrCat[i]);
            }
        }
    },

    async resetSoldInWeek () {
        let arrCat = await Category.find();
        for (let i = 0; i < arrCat.length; i++) {
            arrCat[i].soldInWeek = 0;
            arrCat[i].save();
        }
    }
}