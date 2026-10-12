const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Tài khoản quản trị mặc định (luôn đăng nhập được ngay cả khi DB lỗi hoặc timeout)
const DEMO_USERS = [
    {
        id: 1,
        username: 'admindemo',
        password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        role: 'admin',
        fullname: 'Quản trị viên Demo',
        tram: 'Trạm Trộn Demo'
    }
];

// ==================== GET /auth/login ====================
router.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/home');
    }
    res.render('login', {
        title: 'Đăng Nhập',
        error: req.flash('error')
    });
});

// ==================== POST /auth/login ====================
router.post('/login', async (req, res) => {
    const { username, password, remember } = req.body;

    try {
        let user = null;

        // 1. Kiểm tra tài khoản admindemo trước (đảm bảo không bao giờ bị đơ)
        if (username === 'admin' && (password === '123456' || password === '123456@')) {
            user = DEMO_USERS[0];
        } else {
            // 2. Thử tìm trong DB MariaDB (giới hạn chờ 2 giây để tránh treo web)
            try {
                const db = require('../config/db');
                const [rows] = await Promise.race([
                    db.query('SELECT * FROM users WHERE username = ? AND active = 1 LIMIT 1', [username]),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2000))
                ]);
                if (rows && rows.length > 0) {
                    const isMatch = await bcrypt.compare(password, rows[0].password);
                    if (isMatch) user = rows[0];
                }
            } catch (dbErr) {
                console.warn('DB query error / timeout:', dbErr.message);
            }
        }

        if (!user) {
            req.flash('error', 'Tên đăng nhập hoặc mật khẩu không đúng.');
            return res.redirect('/auth/login');
        }

        // Lưu thông tin vào session
        req.session.user = {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            tram: user.tram
        };

        if (remember === '1') {
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
        }

        return res.redirect('/home');

    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        req.flash('error', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        return res.redirect('/auth/login');
    }
});

// ==================== GET /auth/logout ====================
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = router;
