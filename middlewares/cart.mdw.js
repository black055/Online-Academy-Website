const userModel = require('../models/user.model');
const coursesModel = require('../models/courses.model');

module.exports = async function(req, res, next) {
    if (typeof req.session.cart == 'undefined') 
      req.session.cart = [];
  
    if (req.user && req.user.userType == 'Student') {
      for (let i = 0; i < req.session.cart.length; i++) {
        let isRegistered = false;
        let isExist = false;
        req.user.courses.forEach(course => {
        if (Object.keys(course)[0] == req.session.cart[i])
            isRegistered = true;
        });

        if (isRegistered)
        continue;
        if (req.user.cart.includes(req.session.cart[i])) 
        isExist = true;
        if (isExist)
        continue;

        let cart = req.user.cart;
        cart.push(req.session.cart[i]);
        await userModel.addCart(req.user._id, cart);
        let user = await userModel.getUser(req.user._id);
        user.save();
        req.logIn(user, function (err) {
            console.log(err);
        });
      }
      req.session.cart = [];
      req.session.coursesInCart = [];
    }
  
    if (req.session.cart.length > 0) {
      let coursesInCart = [];
      for (let i = 0; i < req.session.cart.length; i++) {
        let course = await coursesModel.getCourse(req.session.cart[i]);
        coursesInCart.push(course);
      }
      req.session.coursesInCart = coursesInCart;
    }
  
    next();
};