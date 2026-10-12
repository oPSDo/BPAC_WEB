const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth');

// DỮ LIỆU MẪU CHUẨN THEO ẢNH GIAO DIỆN CỦA ANH
const KPI_DEFAULT = {
    nam_m3: '10.487,8',
    nam_kg: '11.531.643,4',
    thang_m3: '0',
    thang_kg: '0',
    ngay_m3: '0',
    ngay_kg: '0',
    tong_vat_lieu: '8.451.495,0',
    tong_xi_mang: '2.162.653,0',
    tong_phu_gia: '68.887,4'
};

const {
    loadData,
    getMacs,
    getMacById,
    saveMac,
    deleteMac,
    getCustomers,
    getCustomerById,
    saveCustomer,
    deleteCustomer,
    getVehicles,
    getVehicleById,
    saveVehicle,
    deleteVehicle
} = require('../services/dataStore');

// ==================== CÁC ROUTES ====================

// Điều hướng trang chủ
router.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/home');
    }
    res.redirect('/auth/login');
});

router.get('/dashboard', (req, res) => {
    res.redirect('/home');
});

// TRANG CHÍNH (/home)
router.get('/home', requireLogin, (req, res) => {
    const liveData = loadData();
    const now = new Date();
    const timeStr = liveData.lastUpdated || now.toTimeString().split(' ')[0];

    res.render('home', {
        title: 'Báo cáo sản xuất trong ngày - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/home',
        currentTime: timeStr,
        stats: liveData.stats,
        topCustomers: liveData.topCustomers || [],
        orders: liveData.orders || []
    });
});

// ==================== QUẢN LÝ MACS (CÔNG THỨC TRỘN) ====================
router.get('/macs', requireLogin, (req, res) => {
    res.render('macs', {
        title: 'Công thức trộn - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/macs',
        kpi: KPI_DEFAULT,
        macs: getMacs()
    });
});

router.get('/macs/get/:id', requireLogin, (req, res) => {
    const mac = getMacById(req.params.id);
    if (!mac) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy công thức trộn' });
    }
    res.json({ success: true, mac });
});

router.post('/macs/save', requireLogin, (req, res) => {
    try {
        const saved = saveMac(req.body);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, message: 'Đã lưu công thức trộn thành công', mac: saved });
        }
        res.redirect('/macs');
    } catch (err) {
        console.error('Lỗi lưu MAC:', err);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.redirect('/macs');
    }
});

router.post('/macs/delete/:id', requireLogin, (req, res) => {
    try {
        deleteMac(req.params.id);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, message: 'Đã xóa công thức trộn thành công' });
        }
        res.redirect('/macs');
    } catch (err) {
        console.error('Lỗi xóa MAC:', err);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.redirect('/macs');
    }
});

// ==================== QUẢN LÝ KHÁCH HÀNG ====================
router.get('/customers', requireLogin, (req, res) => {
    res.render('customers', {
        title: 'Thông tin khách hàng - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/customers',
        kpi: KPI_DEFAULT,
        customers: getCustomers()
    });
});

router.get('/customers/get/:id', requireLogin, (req, res) => {
    const customer = getCustomerById(req.params.id);
    if (!customer) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    }
    res.json({ success: true, customer });
});

router.post('/customers/save', requireLogin, (req, res) => {
    try {
        const saved = saveCustomer(req.body);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, message: 'Đã lưu thông tin khách hàng thành công', customer: saved });
        }
        res.redirect('/customers');
    } catch (err) {
        console.error('Lỗi lưu khách hàng:', err);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.redirect('/customers');
    }
});

router.post('/customers/delete/:id', requireLogin, (req, res) => {
    try {
        deleteCustomer(req.params.id);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, message: 'Đã xóa khách hàng thành công' });
        }
        res.redirect('/customers');
    } catch (err) {
        console.error('Lỗi xóa khách hàng:', err);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.redirect('/customers');
    }
});

// ==================== QUẢN LÝ XE ====================
router.get('/vehicles', requireLogin, (req, res) => {
    res.render('vehicles', {
        title: 'Thông tin xe - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/vehicles',
        kpi: KPI_DEFAULT,
        vehicles: getVehicles()
    });
});

router.get('/vehicles/get/:id', requireLogin, (req, res) => {
    const vehicle = getVehicleById(req.params.id);
    if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    }
    res.json({ success: true, vehicle });
});

router.post('/vehicles/save', requireLogin, (req, res) => {
    try {
        const saved = saveVehicle(req.body);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, message: 'Đã lưu thông tin xe thành công', vehicle: saved });
        }
        res.redirect('/vehicles');
    } catch (err) {
        console.error('Lỗi lưu xe:', err);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.redirect('/vehicles');
    }
});

router.post('/vehicles/delete/:id', requireLogin, (req, res) => {
    try {
        deleteVehicle(req.params.id);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.json({ success: true, message: 'Đã xóa xe thành công' });
        }
        res.redirect('/vehicles');
    } catch (err) {
        console.error('Lỗi xóa xe:', err);
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.redirect('/vehicles');
    }
});

// DỮ LIỆU THEO KHÁCH HÀNG
router.get('/customer-data', requireLogin, (req, res) => {
    res.render('report_view', {
        title: 'Dữ liệu theo khách hàng - Trạm Trộn Asphalt ENQ 01',
        pageTitle: 'DỮ LIỆU THEO KHÁCH HÀNG',
        currentPath: '/customer-data',
        kpi: KPI_DEFAULT
    });
});

// DỮ LIỆU THEO XE
router.get('/vehicle-data', requireLogin, (req, res) => {
    res.render('report_view', {
        title: 'Dữ liệu theo xe - Trạm Trộn Asphalt ENQ 01',
        pageTitle: 'DỮ LIỆU THEO XE',
        currentPath: '/vehicle-data',
        kpi: KPI_DEFAULT
    });
});

const PHIEUS_DEFAULT = [
    { spx: '4311', ngay: '2026-08-04', gio: '16:00:06', ten_kh: 'Phạm Bá Toàn', mac: '250CDC', m3xe: 3.00, khoi_luong: '6145.00', bien_so: '89A-095.14' },
    { spx: '4310', ngay: '2026-08-04', gio: '15:56:16', ten_kh: 'Phạm Bá Toàn', mac: '250CDC', m3xe: 10.00, khoi_luong: '14064.00', bien_so: '89A-095.14' },
    { spx: '4309', ngay: '2026-08-04', gio: '15:46:13', ten_kh: 'Phạm Bá Toàn', mac: '250CDC', m3xe: 10.00, khoi_luong: '14064.00', bien_so: '89A-095.14' },
    { spx: '4308', ngay: '2026-07-28', gio: '20:29:08', ten_kh: 'Phạm Bá Toàn', mac: '300CDC', m3xe: 10.50, khoi_luong: '4853.75', bien_so: '89A-304.63' },
    { spx: '4307', ngay: '2026-07-28', gio: '20:24:44', ten_kh: 'Phạm Bá Toàn', mac: '300CDC', m3xe: 35.00, khoi_luong: '15088.50', bien_so: '89A-304.63' },
    { spx: '4306', ngay: '2026-07-28', gio: '20:09:54', ten_kh: 'Phạm Bá Toàn', mac: '300CDC', m3xe: 35.00, khoi_luong: '15088.50', bien_so: '89A-304.63' },
    { spx: '4305', ngay: '2026-07-28', gio: '19:55:04', ten_kh: 'Phạm Bá Toàn', mac: '300CDC', m3xe: 35.00, khoi_luong: '15088.50', bien_so: '89A-304.63' },
    { spx: '4304', ngay: '2026-07-28', gio: '19:40:12', ten_kh: 'Phạm Bá Toàn', mac: '300CDC', m3xe: 35.00, khoi_luong: '15088.50', bien_so: '89A-304.63' },
    { spx: '4303', ngay: '2026-07-28', gio: '19:25:22', ten_kh: 'Phạm Bá Toàn', mac: '300CDC', m3xe: 35.00, khoi_luong: '15088.50', bien_so: '89A-304.63' }
];

function handlePhieusRoute(req, res) {
    const liveData = loadData();
    const liveOrders = (liveData.orders || []).map(o => ({
        spx: o.spx || '0000',
        ngay: o.thoi_gian ? o.thoi_gian.split(' ')[1] : new Date().toISOString().split('T')[0],
        gio: o.thoi_gian ? o.thoi_gian.split(' ')[2] : '',
        ten_kh: o.ten_kh || 'Khách hàng Trạm ENQ',
        mac: o.mac || 'MAC250',
        m3xe: parseFloat(o.m3xe || 0),
        khoi_luong: o.khoi_luong || '0.00',
        bien_so: o.bien_so || '89A-000.00'
    }));

    // Gộp live orders lên đầu, tiếp đến danh sách mặc định
    const combinedPhieus = [...liveOrders, ...PHIEUS_DEFAULT];

    res.render('phieus', {
        title: 'Báo cáo theo phiếu - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/phieus',
        kpi: KPI_DEFAULT,
        phieus: combinedPhieus
    });
}

// BÁO CÁO THEO PHIẾU (Cả /phieus và /reports đều truy cập được)
router.get('/phieus', requireLogin, handlePhieusRoute);
router.get('/reports', requireLogin, handlePhieusRoute);

// NGƯỜI DÙNG
router.get('/users', requireLogin, (req, res) => {
    res.render('users', {
        title: 'Quản lý người dùng - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/users',
        kpi: KPI_DEFAULT
    });
});

module.exports = router;
