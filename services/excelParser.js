const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Bóc tách file Ghi_CaXe_...xls sinh ra từ WinCC Siemens
 */
function parseCaXe(filePath) {
    try {
        const wb = XLSX.readFile(filePath);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let spx = 1;
        let ngayIn = '';
        let khachHang = '';
        let diaChi = '';
        let mac = 'MAC250';
        let taiXe = '';
        let bienSo = '';
        let thoiGian = '';
        let cl1 = 0, cl2 = 0, cl3 = 0, cl4 = 0, cl5 = 0;
        let pg1 = 0, pg2 = 0, ximang = 0, tongKg = 0;

        for (let i = 0; i < Math.min(rows.length, 30); i++) {
            const row = rows[i] || [];
            for (let j = 0; j < row.length; j++) {
                const cell = String(row[j] || '').trim();
                if (cell.includes('Số phiếu:')) {
                    spx = row[j + 1] || spx;
                }
                if (cell === 'Khách hàng' || cell.includes('Khách hàng')) {
                    if (row[j + 1]) khachHang = String(row[j + 1]).trim();
                }
                if (cell === 'Tên Mác' || cell.includes('Tên Mác')) {
                    if (row[j + 1]) mac = String(row[j + 1]).trim();
                }
                if (cell.includes('Tài xế:')) {
                    if (row[j + 1]) taiXe = String(row[j + 1]).trim();
                }
                if (cell.includes('Biển số xe:')) {
                    if (row[j + 1]) bienSo = String(row[j + 1]).trim();
                    else if (row[j + 2]) bienSo = String(row[j + 2]).trim();
                }
                if (cell === 'Thời gian' || cell.includes('Thời gian')) {
                    if (row[j + 1]) thoiGian = String(row[j + 1]).trim();
                }
                if (cell.includes('Ngày in phiếu:')) {
                    ngayIn = cell.replace('Ngày in phiếu:', '').trim();
                }
            }

            // Dòng thông số xuất khối lượng
            if (String(row[0] || '').toLowerCase().includes('xuất')) {
                cl1 = Number(row[1]) || 0;
                cl2 = Number(row[2]) || 0;
                cl3 = Number(row[3]) || 0;
                cl4 = Number(row[4]) || 0;
                cl5 = Number(row[5]) || 0;
                pg1 = Number(row[6]) || 0;
                pg2 = Number(row[7]) || 0;
                ximang = Number(row[8]) || 0;
                tongKg = cl1 + cl2 + cl3 + cl4 + cl5 + pg1 + pg2 + ximang;
            }
        }

        const m3xe = tongKg > 0 ? (tongKg / 2400).toFixed(1) : '6.0';
        const spxStr = 'SPX' + String(spx).padStart(3, '0');
        const maKhStr = 'KH' + String(spx).padStart(3, '0');

        return {
            id: spxStr + '_' + Date.now(),
            spx: spxStr,
            ma_kh: maKhStr,
            ten_kh: khachHang || 'Khách hàng Trạm FUTA',
            thoi_gian: thoiGian || ngayIn || new Date().toLocaleTimeString('vi-VN'),
            mac: mac || 'C14',
            m3xe: m3xe,
            m3_raw: parseFloat(m3xe),
            cot_lieu: Math.round(cl1 + cl2 + cl3 + cl4 + cl5).toLocaleString('vi-VN'),
            xi_mang: Math.round(ximang).toLocaleString('vi-VN'),
            nuoc: '180',
            pg: Math.round(pg1 + pg2).toLocaleString('vi-VN'),
            khoi_luong: Math.round(tongKg).toLocaleString('vi-VN'),
            kg_raw: tongKg,
            tich_luy: Math.round(tongKg).toLocaleString('vi-VN'),
            nhan_vien: taiXe || 'Thợ trạm',
            che_do: 'Tự động',
            bien_so: bienSo || '89A-304.63',
            file_name: path.basename(filePath)
        };
    } catch (err) {
        console.error('Lỗi phân tích file CaXe:', err.message);
        return null;
    }
}

/**
 * Bóc tách file tổng hợp Ghi_CT Ngày_...xls
 */
function parseCTNgay(filePath) {
    try {
        const wb = XLSX.readFile(filePath);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let totalMe = 0;
        let tongKg = 0;

        for (let i = 8; i < rows.length; i++) {
            const r = rows[i] || [];
            if (r[0] && typeof r[0] === 'number') {
                totalMe++;
                const thamKg = Number(r[12]) || 0;
                tongKg += thamKg;
            }
        }

        return {
            totalMe,
            tongKg,
            tongM3: (tongKg / 2400).toFixed(1)
        };
    } catch (err) {
        console.error('Lỗi phân tích file CTNgay:', err.message);
        return null;
    }
}

module.exports = { parseCaXe, parseCTNgay };
