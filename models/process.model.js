const {Process} = require('../utils/db');
const coursesModel = require('../models/courses.model');
const userModel = require('../models/user.model');

module.exports = {
    async addNewProcess(id_user, id_course) {
        const user = await userModel.getUser(id_user);
        const course = await coursesModel.getCourse(id_course);
        let arrTime = [];
        for (let index = 0; index < course.chapters.length; index++)
            arrTime.push(0);
        
        let process = new Process({"currentChapter": 0, "id_user": id_user, "id_course": id_course, "timeSave": arrTime});
        process.save();
    },

    async getProcess(id_user, id_course) {
        return await Process.findOne({"id_user": id_user, "id_course": id_course});
    },

    async updateTime (id_user, id_course, time) {
        return await Process.findOneAndUpdate({"id_user": id_user, "id_course": id_course}, {$set: {"timeSave": time}});
    }
}