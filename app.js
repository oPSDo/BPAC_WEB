require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const path = require('path');

const app = express();

// Cho phép nhận diện HTTPS qua Reverse Proxy (Botkeep)
app.set('trust proxy', 1);

// ==================== CẤU HÌNH VIEW ENGINE ====================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==================== MIDDLEWARE ====================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình session
app.use(session({
    secret: process.env.SESSION_SECRET || 'tramtron_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 ngày
        httpOnly: true
    }
}));

// Flash messages
app.use(flash());

// Biến global cho views
app.use((req, res, next) => {
    if (req.query.station) {
        req.session.currentStation = String(req.query.station).trim();
    }
    const currentStation = req.session.currentStation || 'tram_1';
    req.session.currentStation = currentStation;
    res.locals.currentStation = currentStation;
    res.locals.stationName = (currentStation === 'tram_2' || currentStation.includes('02')) ? 'Trạm Trộn Asphalt ENQ 02' : 'Trạm Trộn Asphalt ENQ 01';
    res.locals.user = req.session.user || null;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// ==================== ROUTES ====================
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const apiRoutes = require('./routes/api');

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/', dashboardRoutes);

// ==================== 404 HANDLER ====================
app.use((req, res) => {
    res.status(404).render('404', { title: 'Trang không tồn tại' });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { title: 'Lỗi hệ thống', message: err.message });
});

// ==================== KHỞI ĐỘNG SERVER ====================
const PORT = process.env.SERVER_PORT || process.env.PORT || 36322;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});

module.exports = app;
