const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth');

// TÍNH TOÁN KPI THỰC TẾ THEO DỮ LIỆU SẢN XUẤT (KHÔNG DÙNG SỐ DEMO)
function getLiveKpi() {
    const { loadData } = require('../services/dataStore');
    const liveData = loadData();
    const orders = liveData.orders || [];

    let totalM3 = 0;
    let totalKg = 0;
    let tongCotLieu = 0;
    let tongNhua = 0;
    let tongPhuGia = 0;

    orders.forEach(o => {
        totalM3 += (o.m3_raw || 0);
        totalKg += (o.kg_raw || 0);
        const cl = parseFloat(String(o.cot_lieu || 0).replace(/\./g, '').replace(',', '.')) || 0;
        const nhua = parseFloat(String(o.nhua || 0).replace(/\./g, '').replace(',', '.')) || 0;
        const pg = parseFloat(String(o.pg || 0).replace(/\./g, '').replace(',', '.')) || 0;
        tongCotLieu += cl;
        tongNhua += nhua;
        tongPhuGia += pg;
    });

    const m3Str = totalM3 > 0 ? totalM3.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0,0';
    const kgStr = totalKg > 0 ? totalKg.toLocaleString('vi-VN') : '0';

    return {
        nam_m3: m3Str,
        nam_kg: kgStr,
        thang_m3: m3Str,
        thang_kg: kgStr,
        ngay_m3: m3Str,
        ngay_kg: kgStr,
        tong_vat_lieu: tongCotLieu > 0 ? tongCotLieu.toLocaleString('vi-VN') : '0',
        tong_nhua: tongNhua > 0 ? tongNhua.toLocaleString('vi-VN') : '0',
        tong_phu_gia: tongPhuGia > 0 ? tongPhuGia.toLocaleString('vi-VN') : '0'
    };
}

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
    deleteVehicle,
    getAllVehicleBatches,
    getVehicleBatches
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
        kpi: getLiveKpi(),
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
        kpi: getLiveKpi(),
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
        const isJson = req.xhr || req.is('json') || req.headers.accept?.indexOf('json') > -1 || req.headers['content-type']?.indexOf('json') > -1;
        if (isJson) {
            return res.json({ success: true, message: 'Đã lưu thông tin khách hàng thành công', customer: saved });
        }
        res.redirect('/customers');
    } catch (err) {
        console.error('Lỗi lưu khách hàng:', err);
        const isJson = req.xhr || req.is('json') || req.headers.accept?.indexOf('json') > -1 || req.headers['content-type']?.indexOf('json') > -1;
        if (isJson) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.redirect('/customers');
    }
});

router.post('/customers/delete/:id', requireLogin, (req, res) => {
    try {
        deleteCustomer(req.params.id);
        const isJson = req.xhr || req.is('json') || req.headers.accept?.indexOf('json') > -1 || req.headers['content-type']?.indexOf('json') > -1;
        if (isJson) {
            return res.json({ success: true, message: 'Đã xóa khách hàng thành công' });
        }
        res.redirect('/customers');
    } catch (err) {
        console.error('Lỗi xóa khách hàng:', err);
        const isJson = req.xhr || req.is('json') || req.headers.accept?.indexOf('json') > -1 || req.headers['content-type']?.indexOf('json') > -1;
        if (isJson) {
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
        kpi: getLiveKpi(),
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
        const isJson = req.xhr || req.is('json') || req.headers.accept?.indexOf('json') > -1 || req.headers['content-type']?.indexOf('json') > -1;
        if (isJson) {
            return res.json({ success: true, message: 'Đã lưu thông tin xe thành công', vehicle: saved });
        }
        res.redirect('/vehicles');
    } catch (err) {
        console.error('Lỗi lưu xe:', err);
        const isJson = req.xhr || req.is('json') || req.headers.accept?.indexOf('json') > -1 || req.headers['content-type']?.indexOf('json') > -1;
        if (isJson) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.redirect('/vehicles');
    }
});

router.post('/vehicles/delete/:id', requireLogin, (req, res) => {
    try {
        deleteVehicle(req.params.id);
        const isJson = req.xhr || req.is('json') || req.headers.accept?.indexOf('json') > -1 || req.headers['content-type']?.indexOf('json') > -1;
        if (isJson) {
            return res.json({ success: true, message: 'Đã xóa xe thành công' });
        }
        res.redirect('/vehicles');
    } catch (err) {
        console.error('Lỗi xóa xe:', err);
        const isJson = req.xhr || req.is('json') || req.headers.accept?.indexOf('json') > -1 || req.headers['content-type']?.indexOf('json') > -1;
        if (isJson) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.redirect('/vehicles');
    }
});

// DỮ LIỆU THEO KHÁCH HÀNG
router.get('/customer-data', requireLogin, (req, res) => {
    const liveData = loadData();
    const orders = liveData.orders || [];
    const rawCustomers = getCustomers();

    const custMap = {};
    orders.forEach(o => {
        const name = (o.ten_kh && o.ten_kh.trim()) ? o.ten_kh.trim() : 'Khách lẻ';
        if (!custMap[name]) {
            custMap[name] = {
                ten_kh: name,
                dia_chi: o.dia_chi || '',
                so_hd: o.so_hd || '',
                dai_dien: o.nhan_vien || '',
                dien_thoai: '',
                so_chuyen: 0,
                tong_me: 0,
                tong_kg: 0,
                tong_m3: 0,
                tong_cot_lieu: 0,
                tong_nhua: 0,
                tong_pg: 0,
                orders: []
            };
        }
        const kg = o.kg_raw || 0;
        const m3 = o.m3_raw || 0;
        const cl = parseFloat(String(o.cot_lieu || 0).replace(/\./g, '').replace(',', '.')) || 0;
        const nhua = parseFloat(String(o.nhua || 0).replace(/\./g, '').replace(',', '.')) || 0;
        const pg = parseFloat(String(o.pg || 0).replace(/\./g, '').replace(',', '.')) || 0;

        custMap[name].so_chuyen += 1;
        custMap[name].tong_me += (o.sl_me || 6);
        custMap[name].tong_kg += kg;
        custMap[name].tong_m3 += m3;
        custMap[name].tong_cot_lieu += cl;
        custMap[name].tong_nhua += nhua;
        custMap[name].tong_pg += pg;
        custMap[name].orders.push(o);
    });

    rawCustomers.forEach(rc => {
        if (!custMap[rc.ten_kh]) {
            custMap[rc.ten_kh] = {
                ten_kh: rc.ten_kh,
                dia_chi: rc.dia_chi || '',
                so_hd: rc.ghi_chu || '',
                dai_dien: rc.dai_dien || '',
                dien_thoai: rc.dien_thoai || '',
                so_chuyen: 0,
                tong_me: 0,
                tong_kg: 0,
                tong_m3: 0,
                tong_cot_lieu: 0,
                tong_nhua: 0,
                tong_pg: 0,
                orders: []
            };
        } else {
            if (rc.dien_thoai) custMap[rc.ten_kh].dien_thoai = rc.dien_thoai;
            if (rc.dai_dien) custMap[rc.ten_kh].dai_dien = rc.dai_dien;
        }
    });

    const customersList = Object.values(custMap).map(c => ({
        ten_kh: c.ten_kh,
        dia_chi: c.dia_chi,
        so_chuyen: c.so_chuyen,
        tong_kg: c.tong_kg > 0 ? c.tong_kg.toLocaleString('vi-VN') : '0'
    }));

    let selectedCustomer = req.query.cust ? String(req.query.cust).trim() : '';
    if (!selectedCustomer && customersList.length > 0) {
        selectedCustomer = customersList[0].ten_kh;
    }

    const currentCust = custMap[selectedCustomer] || null;
    let customerInfo = null;
    let customerOrders = [];

    if (currentCust) {
        customerInfo = {
            ten_kh: currentCust.ten_kh,
            dia_chi: currentCust.dia_chi,
            so_hd: currentCust.so_hd,
            dai_dien: currentCust.dai_dien,
            dien_thoai: currentCust.dien_thoai || '0913383246',
            so_chuyen: currentCust.so_chuyen,
            tong_me: currentCust.tong_me,
            tong_kg: currentCust.tong_kg,
            tong_m3: currentCust.tong_m3.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
            tong_cot_lieu: currentCust.tong_cot_lieu.toLocaleString('vi-VN'),
            tong_nhua: currentCust.tong_nhua.toLocaleString('vi-VN'),
            tong_pg: currentCust.tong_pg.toLocaleString('vi-VN')
        };
        customerOrders = currentCust.orders;
    }

    res.render('customer_data', {
        title: 'Dữ liệu theo khách hàng - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/customer-data',
        kpi: getLiveKpi(),
        customersList,
        selectedCustomer,
        customerInfo,
        customerOrders
    });
});

// DỮ LIỆU THEO XE
router.get('/vehicle-data', requireLogin, (req, res) => {
    const allBatches = getAllVehicleBatches();
    const vehiclesList = allBatches.map(b => ({
        bien_so: b.bien_so,
        so_me: b.so_me || (b.batches ? b.batches.length : 0),
        tong_kg: Number(b.tong_kg || 0).toLocaleString('vi-VN')
    }));

    let selectedBienSo = req.query.bien_so ? String(req.query.bien_so).trim() : '';
    if (!selectedBienSo && vehiclesList.length > 0) {
        selectedBienSo = vehiclesList[0].bien_so;
    }

    const batchInfo = getVehicleBatches(selectedBienSo);

    res.render('vehicle_data', {
        title: 'Dữ liệu theo xe - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/vehicle-data',
        kpi: getLiveKpi(),
        vehiclesList,
        selectedBienSo,
        batchInfo
    });
});

function handlePhieusRoute(req, res) {
    const liveData = loadData();
    const liveOrders = (liveData.orders || []).map(o => {
        let ngay = '';
        let gio = '';
        if (o.thoi_gian) {
            const parts = o.thoi_gian.split(' ');
            if (parts.length >= 3) {
                ngay = parts[1] || '';
                gio = parts[2] || '';
            } else {
                ngay = o.thoi_gian;
            }
        }
        return {
            spx: o.spx || '0000',
            ngay: ngay,
            gio: gio,
            ten_kh: o.ten_kh || 'Khách lẻ',
            mac: o.mac || '',
            m3xe: parseFloat(o.m3xe || 0),
            khoi_luong: o.khoi_luong || '0.00',
            bien_so: o.bien_so || ''
        };
    });

    res.render('phieus', {
        title: 'Báo cáo theo phiếu - Trạm Trộn Asphalt ENQ 01',
        currentPath: '/phieus',
        kpi: getLiveKpi(),
        phieus: liveOrders
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
        kpi: getLiveKpi()
    });
});

module.exports = router;
