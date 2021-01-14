module.exports = function (req, res, next) {
    let homeUrl = "http://localhost:3000";
    let path = '/';
    if (typeof req.headers.referer != 'undefined') {
        path = req.headers.referer.slice(homeUrl.length);
    }
    if (path != '/logout' && path != '/login' && path != '/register' && path != '/register/OTP' && !path.includes('/forgotPassWord')) {
        req.session.returnTo = req.headers.referer;
    }
    next();
}