const {Category} = require('../utils/db');

module.exports = {

    getMenuCategory() {
        return new Promise(async (resolve, reject) => {
            categories = await Category.find( {"parent" : { $exists: false } } );
            categories = JSON.parse(JSON.stringify(categories));
            for (i = 0; i < categories.length; i++) {
                subCategory = await Category.find( {"parent" : categories[i].name } );
                categories[i].subCategory = JSON.parse(JSON.stringify(subCategory));
            }
            resolve(categories);
        });
    },

    getCategory(name) {
        return Promise.resolve(Category.findOne( {"name" : `${name}`} ));
    },

    getSubCategories(name) {
        return Promise.resolve(Category.find( {"parent" : `${name}`} ));
    },
}