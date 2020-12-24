const {Category} = require('../utils/db');

module.exports = {

    getCategory(name) {
        return Promise.resolve(Category.findOne( {"name" : `${name}`} ));
    },

    getSubCategories(name) {
        return Promise.resolve(Category.find( {"parent" : `${name}`} ));
    },
}