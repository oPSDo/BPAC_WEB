const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'production_data.json');
const MACS_FILE = path.join(__dirname, '..', 'data', 'macs.json');
const CUSTOMERS_FILE = path.join(__dirname, '..', 'data', 'customers.json');
const VEHICLES_FILE = path.join(__dirname, '..', 'data', 'vehicles.json');

// Dữ liệu mặc định ban đầu
const MACS_DEFAULT = [
    {
        id: '1', stt: 1, ten_mac: 'C14',
        cl1: '480.00', cl2: '330.00', cl3: '260.00', cl4: '115.00', cl5: '55.00',
        pg1: '42.00', pg2: '27.50', ten_pg1: 'Bột khoáng (Filler)', ten_pg2: 'Phụ gia SBS',
        ten_cl1: 'Đá 10-20', ten_cl2: 'Đá 5-10', ten_cl3: 'Đá mạt 0-5', ten_cl4: 'Cát xay', ten_cl5: 'Cát hạt mịn',
        do_sut: '160°C'
    },
    {
        id: '2', stt: 2, ten_mac: 'MAC_C19',
        cl1: '520.00', cl2: '300.00', cl3: '240.00', cl4: '120.00', cl5: '50.00',
        pg1: '38.00', pg2: '25.00', ten_pg1: 'Bột khoáng (Filler)', ten_pg2: 'Phụ gia SBS',
        ten_cl1: 'Đá 10-20', ten_cl2: 'Đá 5-10', ten_cl3: 'Đá mạt 0-5', ten_cl4: 'Cát xay', ten_cl5: 'Cát hạt mịn',
        do_sut: '165°C'
    },
    {
        id: '3', stt: 3, ten_mac: 'BTNC 12.5',
        cl1: '470.00', cl2: '340.00', cl3: '270.00', cl4: '110.00', cl5: '50.00',
        pg1: '45.00', pg2: '28.00', ten_pg1: 'Bột khoáng (Filler)', ten_pg2: 'Phụ gia SBS',
        ten_cl1: 'Đá 10-20', ten_cl2: 'Đá 5-10', ten_cl3: 'Đá mạt 0-5', ten_cl4: 'Cát xay', ten_cl5: 'Cát hạt mịn',
        do_sut: '160°C'
    },
    {
        id: '4', stt: 4, ten_mac: 'BTNC 9.5',
        cl1: '350.00', cl2: '420.00', cl3: '280.00', cl4: '130.00', cl5: '60.00',
        pg1: '48.00', pg2: '30.00', ten_pg1: 'Bột khoáng (Filler)', ten_pg2: 'Phụ gia SBS',
        ten_cl1: 'Đá 5-10', ten_cl2: 'Đá 3-8', ten_cl3: 'Đá mạt 0-5', ten_cl4: 'Cát xay', ten_cl5: 'Cát mịn',
        do_sut: '160°C'
    },
    {
        id: '5', stt: 5, ten_mac: 'BTNR 19',
        cl1: '580.00', cl2: '280.00', cl3: '220.00', cl4: '100.00', cl5: '40.00',
        pg1: '30.00', pg2: '20.00', ten_pg1: 'Bột khoáng (Filler)', ten_pg2: 'Phụ gia SBS',
        ten_cl1: 'Đá 10-20', ten_cl2: 'Đá 5-10', ten_cl3: 'Đá mạt 0-5', ten_cl4: 'Cát xay', ten_cl5: 'Cát hạt mịn',
        do_sut: '155°C'
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

// Helper đọc/ghi JSON chung
function readJsonFile(filePath, defaultData) {
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(`Error reading ${filePath}:`, e.message);
        }
    }
    writeJsonFile(filePath, defaultData);
    return defaultData;
}

function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e.message);
    }
}

// ----------------- MACS CRUD -----------------
function getMacs() {
    return readJsonFile(MACS_FILE, MACS_DEFAULT);
}

function getMacById(id) {
    const list = getMacs();
    return list.find(m => String(m.id) === String(id)) || null;
}

function saveMac(macData) {
    const list = getMacs();
    const id = macData.id ? String(macData.id).trim() : '';

    if (id) {
        // Cập nhật MAC đã có
        const idx = list.findIndex(m => String(m.id) === id);
        if (idx >= 0) {
            list[idx] = {
                ...list[idx],
                ...macData,
                id: list[idx].id,
                stt: list[idx].stt || (idx + 1)
            };
            writeJsonFile(MACS_FILE, list);
            return list[idx];
        }
    }

    // Thêm mới MAC
    const nextStt = list.length > 0 ? Math.max(...list.map(m => parseInt(m.stt) || 0)) + 1 : 1;
    const newId = macData.id || String(Date.now());
    const newMac = {
        ...macData,
        id: String(newId),
        stt: nextStt
    };
    list.push(newMac);
    writeJsonFile(MACS_FILE, list);
    return newMac;
}

function deleteMac(id) {
    const list = getMacs();
    const filtered = list.filter(m => String(m.id) !== String(id));
    writeJsonFile(MACS_FILE, filtered);
    return true;
}

// ----------------- CUSTOMERS CRUD -----------------
function getCustomers() {
    return readJsonFile(CUSTOMERS_FILE, CUSTOMERS_DEFAULT);
}

function getCustomerById(id) {
    const list = getCustomers();
    return list.find(c => String(c.id) === String(id)) || null;
}

function saveCustomer(custData) {
    const list = getCustomers();
    const id = custData.id ? String(custData.id).trim() : '';

    if (id) {
        const idx = list.findIndex(c => String(c.id) === id);
        if (idx >= 0) {
            list[idx] = {
                ...list[idx],
                ...custData,
                id: list[idx].id,
                stt: list[idx].stt || (idx + 1)
            };
            writeJsonFile(CUSTOMERS_FILE, list);
            return list[idx];
        }
    }

    const nextStt = list.length > 0 ? Math.max(...list.map(c => parseInt(c.stt) || 0)) + 1 : 1;
    const newId = custData.id || String(Date.now());
    const newCust = {
        ...custData,
        id: String(newId),
        stt: nextStt
    };
    list.push(newCust);
    writeJsonFile(CUSTOMERS_FILE, list);
    return newCust;
}

function deleteCustomer(id) {
    const list = getCustomers();
    const filtered = list.filter(c => String(c.id) !== String(id));
    writeJsonFile(CUSTOMERS_FILE, filtered);
    return true;
}

// ----------------- VEHICLES CRUD -----------------
function getVehicles() {
    return readJsonFile(VEHICLES_FILE, VEHICLES_DEFAULT);
}

function getVehicleById(id) {
    const list = getVehicles();
    return list.find(v => String(v.id) === String(id)) || null;
}

function saveVehicle(vehData) {
    const list = getVehicles();
    const id = vehData.id ? String(vehData.id).trim() : '';

    if (id) {
        const idx = list.findIndex(v => String(v.id) === id);
        if (idx >= 0) {
            list[idx] = {
                ...list[idx],
                ...vehData,
                id: list[idx].id
            };
            writeJsonFile(VEHICLES_FILE, list);
            return list[idx];
        }
    }

    const nextMaLx = list.length > 0 ? Math.max(...list.map(v => parseInt(v.ma_lx) || 0)) + 1 : 1;
    const newId = vehData.id || String(Date.now());
    const newVeh = {
        ...vehData,
        id: String(newId),
        ma_lx: vehData.ma_lx || nextMaLx
    };
    list.push(newVeh);
    writeJsonFile(VEHICLES_FILE, list);
    return newVeh;
}

function deleteVehicle(id) {
    const list = getVehicles();
    const filtered = list.filter(v => String(v.id) !== String(id));
    writeJsonFile(VEHICLES_FILE, filtered);
    return true;
}

// Đảm bảo thư mục data tồn tại
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (e) {
            console.error('Error reading production data file:', e.message);
        }
    }
    return {
        stats: {
            orders_count: 0,
            customers_count: 0,
            total_m3: '0,0',
            total_kg: '0,0'
        },
        orders: [],
        topCustomers: [],
        lastUpdated: new Date().toLocaleTimeString('vi-VN')
    };
}

function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Error writing production data file:', e.message);
    }
}

/**
 * Thêm một đơn / chuyến xe mới vào danh sách và cập nhật KPI
 */
function addOrder(orderData) {
    const data = loadData();

    // Tránh trùng số phiếu
    const existingIndex = data.orders.findIndex(o => o.spx === orderData.spx && o.file_name === orderData.file_name);
    if (existingIndex >= 0) {
        data.orders[existingIndex] = orderData;
    } else {
        data.orders.unshift(orderData); // Đưa lên đầu bảng
    }

    // Cập nhật thống kê KPI
    let totalKg = 0;
    let totalM3 = 0;
    const customerMap = {};

    data.orders.forEach(o => {
        const kg = o.kg_raw || 0;
        const m3 = o.m3_raw || 0;
        totalKg += kg;
        totalM3 += m3;

        const custName = o.ten_kh && o.ten_kh.trim() ? o.ten_kh.trim() : 'Khách lẻ';
        customerMap[custName] = (customerMap[custName] || 0) + m3;
    });

    data.stats.orders_count = data.orders.length;
    data.stats.customers_count = Object.keys(customerMap).length;
    data.stats.total_m3 = totalM3.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    data.stats.total_kg = totalKg.toLocaleString('vi-VN');

    // Cập nhật Top khách hàng
    data.topCustomers = Object.keys(customerMap)
        .map(name => ({
            name,
            m3: customerMap[name].toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        }))
        .sort((a, b) => parseFloat(b.m3.replace(',', '.')) - parseFloat(a.m3.replace(',', '.')));

    data.lastUpdated = new Date().toLocaleTimeString('vi-VN');
    saveData(data);
    return data;
}

function resetData() {
    const emptyData = {
        stats: {
            orders_count: 0,
            customers_count: 0,
            total_m3: '0,0',
            total_kg: '0,0'
        },
        orders: [],
        topCustomers: [],
        lastUpdated: new Date().toLocaleTimeString('vi-VN')
    };
    saveData(emptyData);
    return emptyData;
}

module.exports = {
    loadData,
    saveData,
    resetData,
    addOrder,
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
};

