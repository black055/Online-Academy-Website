const processModel = require('../models/process.model');
const coursesModel = require('../models/courses.model');
const userModel = require('../models/user.model');

module.exports = async function (req, res, next) {
    let arr = await processModel.getAll();
    for(let i = 0; i < arr.length; i++) {
        let user = await userModel.getUser(arr[i].id_user);
        let course = await coursesModel.getCourse(arr[i].id_course);
        if (!user || !course) {
            await processModel.deleteProcess(arr[i]._id);
        }
    }
    next();
}