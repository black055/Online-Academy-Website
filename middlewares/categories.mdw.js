const categoryModel = require('../models/category.model');
const coursesModel = require('../models/courses.model');

module.exports = async function (req, res, next) {
    req.session.user = req.user;
    const categories = await categoryModel.getMenuCategory();
    req.session.categories = categories;
    if (req.user && req.user.userType == 'Student') {
      let coursesInCart = [];
      for (let index = 0; index < req.user.cart.length; index++) {
        let course = await coursesModel.getCourse(req.user.cart[index]);
        coursesInCart.push(course);
      }
      req.session.coursesInCart = coursesInCart;
    }
    next();
}