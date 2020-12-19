const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    email: String,
    name: String,
    password: String,
    fbID: String,
    ggID: String,
    isValidated: Boolean,
    bthday: Date,
    courses: Array,
    userType: String,
    watchList: Array,
});

const teacher = new Schema({
    email: String, 
    name: String,
    bthday: Date,
    password: String,
    courses: Array,
    userType: String,
});

const admin = new Schema({
    password: String,
});

const course = new Schema({
    name: String,
    tags: Array,
    group: String,
    chapters: Array,
    rate: Array,
    price: Number,
    teacher: String,
    students: Number,
    comments: Array,
    description: String,
    views: Number,
    saleOff: Number,
})

module.exports = {
    User: mongoose.model('User', user),
    Teacher: mongoose.model('Teacher', teacher),
    Admin: mongoose.model('Admin', admin),
    Course: mongoose.model('Course', course),
};