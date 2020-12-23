const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    email: String,
    name: String,
    phone: String,
    gender: String,
    password: String,
    fbID: String,
    ggID: String,
    isValidated: Boolean,
    OTP: Number,
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
    rating: Number,
    price: Number,
    teacher: String,
    students: Number,
    comments: Array,
    description: String,
    tinyDes: String,
    isFinished: Boolean,
    views: Number,
    saleOff: Number,
    avatar: String,
})

module.exports = {
    User: mongoose.model('User', user),
    Teacher: mongoose.model('Teacher', teacher),
    Admin: mongoose.model('Admin', admin),
    Course: mongoose.model('Course', course),
};