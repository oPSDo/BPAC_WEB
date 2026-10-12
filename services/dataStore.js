const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'production_data.json');
const MACS_FILE = path.join(__dirname, '..', 'data', 'macs.json');
const CUSTOMERS_FILE = path.join(__dirname, '..', 'data', 'customers.json');
const VEHICLES_FILE = path.join(__dirname, '..', 'data', 'vehicles.json');
const VEHICLE_BATCHES_FILE = path.join(__dirname, '..', 'data', 'vehicle_batches.json');
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Dữ liệu mặc định ban đầu cho Trạm trộn Asphalt ENQ 01
const MACS_DEFAULT = [
    {
        id: '1', stt: 1, ten_mac: '19',
        cl1: '516.00', cl2: '298.00', cl3: '283.00', cl4: '138.00', cl5: '32.00',
        pg1: '56.80', pg2: '27.20', ten_pg1: 'Bột khoáng (Filler PG-F)', ten_pg2: 'Phụ gia PG-D',
        ten_cl1: 'Đá 10-20', ten_cl2: 'Đá 5-10', ten_cl3: 'Đá mạt 0-5', ten_cl4: 'Cát xay', ten_cl5: 'Cát hạt mịn',
        do_sut: '160°C'
    },
    {
        id: '2', stt: 2, ten_mac: 'C14',
        cl1: '480.00', cl2: '330.00', cl3: '260.00', cl4: '115.00', cl5: '55.00',
        pg1: '42.00', pg2: '27.50', ten_pg1: 'Bột khoáng (Filler PG-F)', ten_pg2: 'Phụ gia SBS',
        ten_cl1: 'Đá 10-20', ten_cl2: 'Đá 5-10', ten_cl3: 'Đá mạt 0-5', ten_cl4: 'Cát xay', ten_cl5: 'Cát hạt mịn',
        do_sut: '160°C'
    },
    {
        id: '3', stt: 3, ten_mac: 'BTNC 12.5',
        cl1: '470.00', cl2: '340.00', cl3: '270.00', cl4: '110.00', cl5: '50.00',
        pg1: '45.00', pg2: '28.00', ten_pg1: 'Bột khoáng (Filler PG-F)', ten_pg2: 'Phụ gia SBS',
        ten_cl1: 'Đá 10-20', ten_cl2: 'Đá 5-10', ten_cl3: 'Đá mạt 0-5', ten_cl4: 'Cát xay', ten_cl5: 'Cát hạt mịn',
        do_sut: '160°C'
    },
    {
        id: '4', stt: 4, ten_mac: 'BTNC 9.5',
        cl1: '350.00', cl2: '420.00', cl3: '280.00', cl4: '130.00', cl5: '60.00',
        pg1: '48.00', pg2: '30.00', ten_pg1: 'Bột khoáng (Filler PG-F)', ten_pg2: 'Phụ gia SBS',
        ten_cl1: 'Đá 5-10', ten_cl2: 'Đá 3-8', ten_cl3: 'Đá mạt 0-5', ten_cl4: 'Cát xay', ten_cl5: 'Cát mịn',
        do_sut: '160°C'
    }
];

const CUSTOMERS_DEFAULT = [
    {
        id: '1', stt: 1, ngay: '2026-10-12', ma_kh: 'KH_MHG', mst: '0913383246',
        ten_kh: 'MHG', dai_dien: 'Anh A', nguoi_lh: 'Anh A',
        dia_chi: 'BHG', dien_thoai: '0913383246', email: 'mhg.asphalt@gmail.com',
        tai_khoan_nh: '123', nv_kd: 'Trạm ENQ 01', ghi_chu: 'Hợp đồng số 123', ngan_hang: 'Vietcombank', tich_luy: '8.492'
    }
];

const VEHICLES_DEFAULT = [
    { id: '1', ma_lx: 1, ten_lai_xe: 'A', bien_so_xe: '12345', dien_thoai: '0913383246', thong_tin: 'Đội xe Trạm Asphalt ENQ 01' }
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

function loadData(station = 'tram_1') {
    let raw = {
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

    if (fs.existsSync(DATA_FILE)) {
        try {
            raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (e) {
            console.error('Error reading production data file:', e.message);
        }
    }

    const cleanStation = String(station || 'tram_1').toLowerCase();
    
    // Nếu chọn Trạm Trộn 02
    if (cleanStation === 'tram_2' || cleanStation.includes('02') || cleanStation.includes('tram2')) {
        const orders2 = (raw.orders || []).filter(o => o.station === 'tram_2' || o.station === 'ENQ_02' || o.station === 'BPAC_Tram_02');
        if (orders2.length === 0) {
            return {
                stationName: 'Trạm Trộn Asphalt ENQ 02',
                stationId: 'tram_2',
                stats: {
                    orders_count: 0,
                    customers_count: 0,
                    total_m3: '0,0',
                    total_kg: '0,0'
                },
                orders: [],
                topCustomers: [],
                lastUpdated: 'Chưa có mẻ trộn hôm nay'
            };
        }
        let totalKg = 0;
        let totalM3 = 0;
        const custMap = {};
        orders2.forEach(o => {
            totalKg += (o.kg_raw || 0);
            totalM3 += (o.m3_raw || 0);
            const cName = o.ten_kh || 'Khách lẻ';
            custMap[cName] = (custMap[cName] || 0) + (o.m3_raw || 0);
        });
        return {
            stationName: 'Trạm Trộn Asphalt ENQ 02',
            stationId: 'tram_2',
            stats: {
                orders_count: orders2.length,
                customers_count: Object.keys(custMap).length,
                total_m3: totalM3.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
                total_kg: totalKg.toLocaleString('vi-VN')
            },
            orders: orders2,
            topCustomers: Object.keys(custMap).map(k => ({ name: k, m3: custMap[k].toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) })),
            lastUpdated: raw.lastUpdated || new Date().toLocaleTimeString('vi-VN')
        };
    }

    // Mặc định: Trạm Trộn Asphalt ENQ 01
    const orders1 = (raw.orders || []).filter(o => !o.station || o.station === 'tram_1' || o.station === 'ENQ_01' || o.station === 'BPAC_Tram_01');
    let totalKg = 0;
    let totalM3 = 0;
    const custMap = {};
    orders1.forEach(o => {
        totalKg += (o.kg_raw || 0);
        totalM3 += (o.m3_raw || 0);
        const cName = o.ten_kh || 'Khách lẻ';
        custMap[cName] = (custMap[cName] || 0) + (o.m3_raw || 0);
    });

    return {
        stationName: 'Trạm Trộn Asphalt ENQ 01',
        stationId: 'tram_1',
        stats: {
            orders_count: orders1.length,
            customers_count: Object.keys(custMap).length,
            total_m3: totalM3.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
            total_kg: totalKg.toLocaleString('vi-VN')
        },
        orders: orders1,
        topCustomers: Object.keys(custMap).map(k => ({ name: k, m3: custMap[k].toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) })),
        lastUpdated: raw.lastUpdated || new Date().toLocaleTimeString('vi-VN')
    };
}

function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Error writing production data file:', e.message);
    }
}

function ensureVehicleAndCustomer(order) {
    if (!order) return;
    try {
        if (order.bien_so) {
            const vehicles = getVehicles();
            const foundVeh = vehicles.find(v => String(v.bien_so_xe).trim().toLowerCase() === String(order.bien_so).trim().toLowerCase());
            if (!foundVeh) {
                saveVehicle({
                    ten_lai_xe: order.nhan_vien || order.tai_xe || 'A',
                    bien_so_xe: order.bien_so,
                    dien_thoai: '0913383246',
                    thong_tin: 'Đội xe Trạm Asphalt ENQ 01'
                });
            }
        }
        if (order.ten_kh && order.ten_kh !== 'Khách lẻ') {
            const customers = getCustomers();
            const foundCust = customers.find(c => String(c.ten_kh).trim().toLowerCase() === String(order.ten_kh).trim().toLowerCase());
            if (!foundCust) {
                saveCustomer({
                    ma_kh: order.ma_kh || ('KH_' + String(order.ten_kh).replace(/\s+/g, '')),
                    ten_kh: order.ten_kh,
                    ngay: new Date().toISOString().split('T')[0],
                    dai_dien: order.nhan_vien || 'Anh A',
                    nguoi_lh: order.nhan_vien || 'Anh A',
                    dia_chi: order.dia_chi || 'BHG',
                    dien_thoai: '0913383246',
                    ghi_chu: order.so_hd ? ('Hợp đồng số ' + order.so_hd) : '',
                    tich_luy: order.khoi_luong || '0.00'
                });
            }
        }
    } catch (e) {
        console.error('Lỗi tự động thêm xe/khách hàng:', e.message);
    }
}

/**
 * Thêm một đơn / chuyến xe mới vào danh sách và cập nhật KPI
 */
function addOrder(orderData) {
    const data = loadData();
    ensureVehicleAndCustomer(orderData);

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

// ----------------- VEHICLE BATCHES (CHI TIẾT MẺ XE) -----------------
const VEHICLE_BATCHES_DEFAULT = [
    {
        bien_so: '12345',
        spx: 'SPX004',
        tai_xe: 'A',
        mac: '19',
        so_me: 6,
        tong_kg: 8492,
        m3: '3.5',
        thoi_gian: '10/12/2026 15:45:49',
        batches: [
            { me_stt: 1, thoi_gian: '15:41:47', mac: '19', cl1: 511, cl2: 304, cl3: 299, cl4: 141, cl5: 40, pg1: 56.6, pg2: 26.2, nhua: 59.5, sbs: 2.87, tham_kg: 1440 },
            { me_stt: 2, thoi_gian: '15:42:31', mac: '19', cl1: 521, cl2: 296, cl3: 272, cl4: 126, cl5: 41, pg1: 56.4, pg2: 25.6, nhua: 59.4, sbs: 2.87, tham_kg: 1400 },
            { me_stt: 3, thoi_gian: '15:43:17', mac: '19', cl1: 519, cl2: 294, cl3: 277, cl4: 145, cl5: 24, pg1: 56.5, pg2: 27.1, nhua: 61.2, sbs: 2.87, tham_kg: 1407 },
            { me_stt: 4, thoi_gian: '15:43:59', mac: '19', cl1: 511, cl2: 304, cl3: 299, cl4: 141, cl5: 40, pg1: 56.5, pg2: 28.9, nhua: 59.8, sbs: 2.87, tham_kg: 1443 },
            { me_stt: 5, thoi_gian: '15:45:02', mac: '19', cl1: 520, cl2: 287, cl3: 282, cl4: 134, cl5: 26, pg1: 58.6, pg2: 27.3, nhua: 59.1, sbs: 2.87, tham_kg: 1397 },
            { me_stt: 6, thoi_gian: '15:45:26', mac: '19', cl1: 511, cl2: 309, cl3: 270, cl4: 146, cl5: 20, pg1: 56.3, pg2: 28.9, nhua: 61.3, sbs: 2.87, tham_kg: 1405 }
        ]
    }
];

function getAllVehicleBatches() {
    return readJsonFile(VEHICLE_BATCHES_FILE, VEHICLE_BATCHES_DEFAULT);
}

function getVehicleBatches(bienSo) {
    const list = getAllVehicleBatches();
    if (!bienSo) return list[0] || null;
    const cleanBien = String(bienSo).trim().toLowerCase();
    return list.find(v => String(v.bien_so).trim().toLowerCase() === cleanBien) || list[0] || null;
}

function saveVehicleBatches(batchData) {
    if (!batchData || !batchData.bien_so) return null;
    const list = getAllVehicleBatches();
    const cleanBien = String(batchData.bien_so).trim();
    const idx = list.findIndex(v => String(v.bien_so).trim().toLowerCase() === cleanBien.toLowerCase());
    
    const formatted = {
        bien_so: cleanBien,
        spx: batchData.spx || 'SPX001',
        tai_xe: batchData.nhan_vien || batchData.tai_xe || 'A',
        mac: batchData.mac || '19',
        so_me: batchData.so_me || (batchData.batches ? batchData.batches.length : 0),
        tong_kg: batchData.kg_raw || batchData.tong_kg || 0,
        m3: batchData.m3xe || batchData.m3 || (batchData.kg_raw ? (batchData.kg_raw / 2400).toFixed(1) : '0.0'),
        thoi_gian: batchData.thoi_gian || new Date().toLocaleString('vi-VN'),
        batches: batchData.batches || []
    };

    if (idx >= 0) {
        list[idx] = formatted;
    } else {
        list.push(formatted);
    }
    writeJsonFile(VEHICLE_BATCHES_FILE, list);
    return formatted;
}

// ----------------- USERS CRUD -----------------
const USERS_DEFAULT = [
    {
        id: '1', stt: 1, username: 'admin', fullname: 'Quản trị viên Hệ thống',
        role: 'admin', tram: 'Tất cả các trạm', active: 1, email: 'admin@enq.com.vn',
        phone: '0913383246', created_at: '2026-10-12'
    },
    {
        id: '2', stt: 2, username: 'admindemo', fullname: 'Quản trị viên Demo',
        role: 'admin', tram: 'Trạm Trộn Asphalt ENQ 01', active: 1, email: 'demo@enq.com.vn',
        phone: '0912888729', created_at: '2026-10-12'
    },
    {
        id: '3', stt: 3, username: 'operator01', fullname: 'Kỹ sư vận hành Trạm 01',
        role: 'operator', tram: 'Trạm Trộn Asphalt ENQ 01', active: 1, email: 'operator01@enq.com.vn',
        phone: '0988888888', created_at: '2026-10-12'
    },
    {
        id: '4', stt: 4, username: 'operator02', fullname: 'Kỹ sư vận hành Trạm 02',
        role: 'operator', tram: 'Trạm Trộn Asphalt ENQ 02', active: 1, email: 'operator02@enq.com.vn',
        phone: '0977777777', created_at: '2026-10-12'
    }
];

function getUsers() {
    return readJsonFile(USERS_FILE, USERS_DEFAULT);
}

function getUserById(id) {
    const list = getUsers();
    return list.find(u => String(u.id) === String(id)) || null;
}

function saveUser(userData) {
    const list = getUsers();
    const id = userData.id ? String(userData.id).trim() : '';

    if (id) {
        const idx = list.findIndex(u => String(u.id) === id);
        if (idx >= 0) {
            list[idx] = {
                ...list[idx],
                ...userData,
                id: list[idx].id,
                stt: list[idx].stt || (idx + 1),
                active: userData.active !== undefined ? Number(userData.active) : list[idx].active
            };
            writeJsonFile(USERS_FILE, list);
            return list[idx];
        }
    }

    const nextStt = list.length > 0 ? Math.max(...list.map(u => parseInt(u.stt) || 0)) + 1 : 1;
    const newId = userData.id || String(Date.now());
    const newUser = {
        ...userData,
        id: String(newId),
        stt: nextStt,
        active: userData.active !== undefined ? Number(userData.active) : 1,
        created_at: userData.created_at || new Date().toISOString().split('T')[0]
    };
    list.push(newUser);
    writeJsonFile(USERS_FILE, list);
    return newUser;
}

function deleteUser(id) {
    const list = getUsers();
    const filtered = list.filter(u => String(u.id) !== String(id));
    writeJsonFile(USERS_FILE, filtered);
    return true;
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
    deleteVehicle,
    getAllVehicleBatches,
    getVehicleBatches,
    saveVehicleBatches,
    getUsers,
    getUserById,
    saveUser,
    deleteUser
};

