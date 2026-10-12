const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'production_data.json');

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

        const custName = o.ten_kh || 'Khách hàng FUTA';
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

module.exports = { loadData, saveData, addOrder };
