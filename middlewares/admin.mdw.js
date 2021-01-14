module.exports = function (req, res, next) {
    if (typeof req.user == 'undefined' || req.user.userType != 'Admin') {
        res.redirect('/');
    } else next();
}