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

const MACS_DEFAULT = [
    {
        id: '1', stt: 1, ten_mac: 'MAC01',
        cl1: '200.00', cl2: '200.00', cl3: '200.00', cl4: '300.00', cl5: '300.00',
        xm1: '150.00', xm2: '150.00', xm3: '250.00', xm4: '250.00', nuoc: '350.00',
        pg1: '14.60', pg2: '9.90', ten_pg1: 'PGG1', ten_pg2: 'PGG2',
        ten_cl1: 'Cát vàng', ten_cl2: 'cát đen', ten_cl3: 'sỏi', ten_cl4: 'đá 22', ten_cl5: 'đá 21',
        ten_xm1: 'Hoàng Thạch', ten_xm2: 'Hồng Hà', ten_xm3: 'Bỉm sơn', ten_xm4: 'Tro bay',
        do_sut: '15.00'
    },
    {
        id: '2', stt: 2, ten_mac: 'MAC02',
        cl1: '250.00', cl2: '300.00', cl3: '450.00', cl4: '160.00', cl5: '90.00',
        xm1: '60.00', xm2: '20.00', xm3: '20.00', xm4: '20.00', nuoc: '66.00',
        pg1: '5.50', pg2: '9.90', ten_pg1: 'PG1', ten_pg2: 'PG2',
        ten_cl1: 'Đá 21', ten_cl2: 'đá 22', ten_cl3: 'cát sông', ten_cl4: 'cat đen', ten_cl5: 'cat vang',
        ten_xm1: 'hoang thach', ten_xm2: 'hong ha', ten_xm3: 'visai', ten_xm4: 'hong ha',
        do_sut: '10.50'
    },
    {
        id: '3', stt: 3, ten_mac: 'MAC03',
        cl1: '205.00', cl2: '300.00', cl3: '450.00', cl4: '160.00', cl5: '90.00',
        xm1: '60.00', xm2: '20.00', xm3: '20.00', xm4: '20.00', nuoc: '66.00',
        pg1: '5.50', pg2: '9.90', ten_pg1: 'PG1', ten_pg2: 'PG2',
        ten_cl1: 'Đá 21', ten_cl2: 'đá 22', ten_cl3: 'cát sông', ten_cl4: 'cat đen', ten_cl5: 'cat vang',
        ten_xm1: 'hoang thach', ten_xm2: 'hong ha', ten_xm3: 'visai', ten_xm4: 'hong ha',
        do_sut: '10.50'
    },
    {
        id: '1002', stt: 1002, ten_mac: 'MAC04',
        cl1: '150.00', cl2: '250.00', cl3: '350.00', cl4: '450.00', cl5: '550.00',
        xm1: '100.00', xm2: '200.00', xm3: '300.00', xm4: '400.00', nuoc: '500.00',
        pg1: '15.50', pg2: '25.50', ten_pg1: 'PG1', ten_pg2: 'PG2',
        ten_cl1: 'Cát1', ten_cl2: 'Cát2', ten_cl3: 'Cát3', ten_cl4: 'Đá1', ten_cl5: 'Đá2',
        ten_xm1: 'Hoàng Thạch', ten_xm2: 'Hồng phong', ten_xm3: 'phúc sơn', ten_xm4: 'Bút sơn',
        do_sut: '0.00'
    },
    {
        id: '1003', stt: 1003, ten_mac: 'MAC05',
        cl1: '150.00', cl2: '250.00', cl3: '350.00', cl4: '450.00', cl5: '550.00',
        xm1: '100.00', xm2: '200.00', xm3: '300.00', xm4: '400.00', nuoc: '500.00',
        pg1: '15.50', pg2: '25.50', ten_pg1: 'PG1', ten_pg2: 'PG2',
        ten_cl1: 'Cát1', ten_cl2: 'Cát2', ten_cl3: 'Cát3', ten_cl4: 'Đá1', ten_cl5: 'Đá2',
        ten_xm1: 'Hoàng Thạch', ten_xm2: 'Hồng phong', ten_xm3: 'phúc sơn', ten_xm4: 'Bút sơn',
        do_sut: '10.00'
    }
];

const CUSTOMERS_DEFAULT = [
    {
        id: '1', stt: 1, ngay: '2025-01-31', ma_kh: 'KH001', mst: '0915115116',
        ten_kh: 'Công ty TNHH Tự động hóa ABC', dai_dien: 'Nguyễn Tiến Giang', nguoi_lh: 'Nguyễn Tiến Giang',
        dia_chi: 'Huỳnh Cung - Tam Hiệp - Thanh Trì - Hà Nội', dien_thoai: '0912888729', email: 'armataauto@gmail.com',
        tai_khoan_nh: '0341005047647', nv_kd: 'Lê Tí', ghi_chu: 'Khách hàng khó tính', ngan_hang: 'VCB Hải Dương', tich_luy: '902.00'
    },
    {
        id: '2003', stt: 2003, ngay: '2025-04-01', ma_kh: 'KH0010', mst: '0912888759',
        ten_kh: 'Công ty XD và Thương Mại ACB', dai_dien: 'anh A', nguoi_lh: 'Anh A',
        dia_chi: 'Địa chỉ anh A', dien_thoai: '0123456789', email: '',
        tai_khoan_nh: '', nv_kd: 'Lê Anh', ghi_chu: '', ngan_hang: 'ACB Hưng Yên', tich_luy: '237.10'
    },
    {
        id: '2004', stt: 2004, ngay: '2025-04-01', ma_kh: 'KH0011', mst: '0912888753',
        ten_kh: 'Công ty XD và Thương Mại ACBa', dai_dien: 'anh Aa', nguoi_lh: 'Anh Aa',
        dia_chi: 'Địa chỉ anh A', dien_thoai: '0123456788', email: '',
        tai_khoan_nh: '123', nv_kd: 'Lê Anh', ghi_chu: '', ngan_hang: 'ACB Hưng Yên', tich_luy: '20.00'
    },
    {
        id: '2', stt: 2, ngay: '2025-02-01', ma_kh: 'KH002', mst: '0901115084',
        ten_kh: 'Công ty TNHH Tự động hóa D Tech', dai_dien: 'Lê Việt Anh', nguoi_lh: 'Lê Việt Anh',
        dia_chi: 'Đội 3 thôn Phương Thượng xã Phương Nam TP Hưng Yên', dien_thoai: '0912888729', email: 'mr.anhv@gmail.com',
        tai_khoan_nh: '0341005047647', nv_kd: 'Phạm Thế Thảo', ghi_chu: 'Công ty tại địa bàn Hưng Yên', ngan_hang: '', tich_luy: '518.10'
    },
    {
        id: '9', stt: 9, ngay: '2025-02-01', ma_kh: 'KH003', mst: '123456789',
        ten_kh: 'Công ty TM và đầu tư Tín Phong', dai_dien: 'Nguyễn Thị Mai', nguoi_lh: 'Nguyễn Thị Mai',
        dia_chi: '999 Ka Long, TP Móng Cái, Quảng Ninh', dien_thoai: '09123456789', email: 'tinphong@gmail.com',
        tai_khoan_nh: '', nv_kd: 'Lê Tí', ghi_chu: '', ngan_hang: '', tich_luy: '354.10'
    }
];

const VEHICLES_DEFAULT = [
    { id: '1', ma_lx: 1, ten_lai_xe: 'Lê Việt Anh', bien_so_xe: '89A-304.63', dien_thoai: '1234566789', thong_tin: 'Đội xe GHT' },
    { id: '2', ma_lx: 2, ten_lai_xe: 'Phạm Thế Thảo', bien_so_xe: '89A-095.14', dien_thoai: '998899899', thong_tin: 'Đội xe sửa chữa' },
    { id: '3', ma_lx: 3, ten_lai_xe: 'Phạm Thế Thảo', bien_so_xe: '89A-095.14', dien_thoai: '123456', thong_tin: 'Đội xe sửa chữa' },
    { id: '4', ma_lx: 4, ten_lai_xe: 'Phạm Thế Thảo', bien_so_xe: '89A-095.14', dien_thoai: '55555555', thong_tin: 'Đội xe sửa chữa' },
    { id: '6', ma_lx: 6, ten_lai_xe: 'Lê Tèo', bien_so_xe: '89A-304.63', dien_thoai: '0912345678', thong_tin: 'Đội xe GHT' },
    { id: '7', ma_lx: 7, ten_lai_xe: 'Lê Tí', bien_so_xe: '89A-304.63', dien_thoai: '475845454', thong_tin: 'Đội xe GHT' }
];

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
    const { loadData } = require('../services/dataStore');
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

// TRANG CÔNG THỨC TRỘN (/macs)
router.get('/macs', requireLogin, (req, res) => {
    res.render('macs', {
        title: 'Công thức trộn - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/macs',
        kpi: KPI_DEFAULT,
        macs: MACS_DEFAULT
    });
});

// TRANG THÔNG TIN KHÁCH HÀNG (/customers)
router.get('/customers', requireLogin, (req, res) => {
    res.render('customers', {
        title: 'Thông tin khách hàng - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/customers',
        kpi: KPI_DEFAULT,
        customers: CUSTOMERS_DEFAULT
    });
});

// TRANG THÔNG TIN XE (/vehicles)
router.get('/vehicles', requireLogin, (req, res) => {
    res.render('vehicles', {
        title: 'Thông tin xe - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/vehicles',
        kpi: KPI_DEFAULT,
        vehicles: VEHICLES_DEFAULT
    });
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

// BÁO CÁO THEO PHIẾU
router.get('/reports', requireLogin, (req, res) => {
    res.render('report_view', {
        title: 'Báo cáo theo phiếu - Trạm Trộn Asphalt ENQ 01',
        pageTitle: 'BÁO CÁO THEO PHIẾU',
        currentPath: '/reports',
        kpi: KPI_DEFAULT
    });
});

// NGƯỜI DÙNG
router.get('/users', requireLogin, (req, res) => {
    res.render('users', {
        title: 'Quản lý người dùng - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/users',
        kpi: KPI_DEFAULT
    });
});

module.exports = router;
