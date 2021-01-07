module.exports = function (req, res, next) {
    console.log(req.user);
    if (!req.user && !req.session.user_invalidated) res.redirect('/');
    else next();
}