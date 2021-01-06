module.exports = function (req, res, next) {
    let homeUrl = "http://localhost:3000";
    let path = req.headers.referer.slice(homeUrl.length);
    if (path != '/login' && path != '/register' && path != '/register/OTP') {
        req.session.returnTo = req.headers.referer;
    }
    next();
}