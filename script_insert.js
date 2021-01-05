const {User, Teacher, Admin, Course, Category} = require('./utils/db');
const {user_data, course_data, category_data, teacher_data} = require('./utils/insert');
const bcrypt = require('bcrypt');

module.exports = async function b() {
    for (let i = 0; i < user_data.length; i++) {
        let user = await User.findOne({'email': user_data[i].email});
        if (!user) {
            user = new User(user_data[i]);
            user.save();
        }
    }
  
    for (let i = 0; i < course_data.length; i++) {
      let course = await Course.findOne({ 'name': course_data[i].name});
      if (course == null) {
        course = new Course(course_data[i]);
        course.save();
      }
    }
  
    for (let i = 0; i < category_data.length; i++) {
      let category = await Category.findOne({ 'name': category_data[i].name});
      if (category == null) {
        category = new Category(category_data[i]);
        category.save();
      }
    }
  
    for (let i = 0; i < teacher_data.length; i++) {
      let teacher = new Teacher(teacher_data[i]);
      teacher.save();
    }
  
    const admin = new Admin({username: 'admin', password: bcrypt.hashSync('22102000', 10), userType: 'Admin'});
    admin.save();
}; 