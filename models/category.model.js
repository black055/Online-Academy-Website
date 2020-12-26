const {Course, Category} = require('../utils/db');

module.exports = {

    getMenuCategory() {
        return new Promise(async (resolve, reject) => {
            categories = await Category.find( { "parent" : 'null' });
            for (i = 0; i < categories.length; i++) {
                subCategory = await Category.find( {"parent" : categories[i].name } );
                categories[i].subCategory = JSON.parse(JSON.stringify(subCategory));
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
    }
}