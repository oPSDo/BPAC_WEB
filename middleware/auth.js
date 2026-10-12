/**
 * Middleware kiểm tra đăng nhập
 */
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    req.flash('error', 'Vui lòng đăng nhập để tiếp tục.');
    res.redirect('/auth/login');
}

/**
 * Middleware kiểm tra quyền admin
 */
function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).render('error', {
        title: 'Không có quyền',
        message: 'Bạn không có quyền truy cập trang này.'
    });
}

module.exports = { requireLogin, requireAdmin };
