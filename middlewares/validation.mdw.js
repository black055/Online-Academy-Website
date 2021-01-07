module.exports = function (req, res, next) {
    if ((typeof req.user) !== 'undefined' && !req.user.isValidated && req.user.userType == 'Student') {
        req.session.user = req.user;
        req.session.user_invalidated = null;
        res.redirect('/register/OTP');
    } else next();
}