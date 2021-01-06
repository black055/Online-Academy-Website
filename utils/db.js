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
    cart: Array,
});

const teacher = new Schema({
    email: String, 
    name: String,
    bthday: Date,
    password: String,
    courses: Array,
    userType: String,
    phone: String,
    gender: String,
    shortBio: String,
});

const admin = new Schema({
    username: String,
    password: String,
    userType: String,
});

const course = new Schema({
    name: String,
    category: String,
    chapters: Array,
    rate: Array,
    price: Number,
    teacher: String,
    students: Number,
    description: String,
    briefDes: String,
    isFinished: Boolean,
    views: Number,
    saleOff: Number,
    thumbnail: String,
    commands: Array,
    target: String,
    soldInWeek: Number,
    lastModified: Date,
    createdDate: Date,
    require: String,
    purpose: String
})

const category = Schema({
    name: String,
    parent: String,
    courses: Array,
    soldInWeek: Number
})

course.index({name: 'text'});

module.exports = {
    User: mongoose.model('User', user),
    Teacher: mongoose.model('Teacher', teacher),
    Admin: mongoose.model('Admin', admin),
    Course: mongoose.model('Course', course),
    Category: mongoose.model('Category', category),
};