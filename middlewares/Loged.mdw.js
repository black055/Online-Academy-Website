module.exports = function (req, res, next) {
    if (typeof req.user == 'undefined')
        res.redirect('/login');
    else next();
}