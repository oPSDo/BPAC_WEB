const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Chuyển đổi số thập phân thời gian của Excel sang HH:MM:SS
 */
function fractionToTime(frac) {
    if (!frac && frac !== 0) return '';
    if (typeof frac === 'string') return frac.trim();
    const num = Number(frac);
    if (isNaN(num)) return '';
    const totalSeconds = Math.round(num * 86400);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

/**
 * Bóc tách file chuyến xe Ghi_CaXe_...xls sinh ra từ hệ thống trạm trộn Siemens WinCC
 */
function parseCaXe(filePath) {
    try {
        const wb = XLSX.readFile(filePath);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let spx = '';
        let ngayIn = '';
        let khachHang = '';
        let diaChi = '';
        let soHd = '';
        let mac = '';
        let taiXe = '';
        let bienSo = '';
        let thoiGian = '';
        let cl1 = 0, cl2 = 0, cl3 = 0, cl4 = 0, cl5 = 0;
        let pg1 = 0, pg2 = 0, nhua = 0, sbs = 0, tongKg = 0, slMe = 0;

        for (let i = 0; i < Math.min(rows.length, 30); i++) {
            const row = rows[i] || [];
            for (let j = 0; j < row.length; j++) {
                const cell = String(row[j] || '').trim();

                // Số phiếu
                if (cell.includes('Số phiếu:')) {
                    const val = row[j + 1] !== undefined ? row[j + 1] : row[j + 2];
                    if (val !== undefined && val !== null && String(val).trim() !== '') {
                        spx = String(val).trim();
                    }
                }

                // Khách hàng
                if (cell === 'Khách hàng' || cell.includes('Khách hàng')) {
                    for (let k = j + 1; k < Math.min(j + 4, row.length); k++) {
                        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
                            khachHang = String(row[k]).trim();
                            break;
                        }
                    }
                }

                // Địa chỉ
                if (cell === 'Địa chỉ' || cell.includes('Địa chỉ')) {
                    for (let k = j + 1; k < Math.min(j + 4, row.length); k++) {
                        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
                            diaChi = String(row[k]).trim();
                            break;
                        }
                    }
                }

                // Số hợp đồng
                if (cell.includes('Số hợp đồng')) {
                    for (let k = j + 1; k < Math.min(j + 4, row.length); k++) {
                        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
                            soHd = String(row[k]).trim();
                            break;
                        }
                    }
                }

                // Tên Mác
                if (cell === 'Tên Mác' || cell.includes('Tên Mác')) {
                    for (let k = j + 1; k < Math.min(j + 4, row.length); k++) {
                        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '' && String(row[k]).trim() !== '0') {
                            mac = String(row[k]).trim();
                            break;
                        }
                    }
                }

                // Tài xế
                if (cell.includes('Tài xế:')) {
                    for (let k = j + 1; k < Math.min(j + 4, row.length); k++) {
                        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
                            taiXe = String(row[k]).trim();
                            break;
                        }
                    }
                }

                // Biển số xe
                if (cell.includes('Biển số xe:')) {
                    for (let k = j + 1; k < Math.min(j + 4, row.length); k++) {
                        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
                            bienSo = String(row[k]).trim();
                            break;
                        }
                    }
                }

                // Thời gian
                if (cell === 'Thời gian' || cell.includes('Thời gian')) {
                    for (let k = j + 1; k < Math.min(j + 4, row.length); k++) {
                        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
                            thoiGian = String(row[k]).trim();
                            break;
                        }
                    }
                }

                // Ngày in phiếu
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
                pg1 = Number(row[6]) || 0;  // PG-F / Bột đá
                pg2 = Number(row[7]) || 0;  // PG-D
                nhua = Number(row[8]) || 0; // Nhựa đường Asphalt
                sbs = Number(row[9]) || 0;  // SBS polyme
                const klTham = Number(row[10]) || 0;
                slMe = Number(row[11]) || 0;

                tongKg = klTham > 0 ? klTham : (cl1 + cl2 + cl3 + cl4 + cl5 + pg1 + pg2 + nhua + sbs);
            }
        }

        // Tỷ trọng bê tông nhựa nóng Asphalt: 2400 kg/m³
        const m3xe = tongKg > 0 ? (tongKg / 2400).toFixed(1) : '0.0';
        
        let spxStr = '';
        if (spx !== '') {
            const num = parseInt(spx);
            spxStr = !isNaN(num) ? 'SPX' + String(num).padStart(3, '0') : String(spx);
        } else {
            const m = path.basename(filePath).match(/(\d+)h_(\d+)m_(\d+)s/i);
            spxStr = m ? `SPX_${m[1]}${m[2]}` : 'SPX_' + Date.now().toString().slice(-4);
        }

        const cotLieuTotal = Math.round(cl1 + cl2 + cl3 + cl4 + cl5);
        const pgTotal = Math.round(pg1 + pg2 + sbs);

        return {
            id: spxStr + '_' + Date.now(),
            spx: spxStr,
            ma_kh: khachHang ? 'KH_' + khachHang.substring(0, 4).toUpperCase().replace(/\s+/g, '') : 'KH_LE',
            ten_kh: khachHang || 'Khách lẻ',
            dia_chi: diaChi || '',
            so_hd: soHd || '',
            thoi_gian: thoiGian || ngayIn || new Date().toLocaleString('vi-VN'),
            mac: mac || 'C19',
            m3xe: m3xe,
            m3_raw: parseFloat(m3xe),
            cot_lieu: cotLieuTotal.toLocaleString('vi-VN'),
            nhua: Math.round(nhua).toLocaleString('vi-VN'),
            pg: pgTotal.toLocaleString('vi-VN'),
            khoi_luong: Math.round(tongKg).toLocaleString('vi-VN'),
            kg_raw: tongKg,
            tich_luy: Math.round(tongKg).toLocaleString('vi-VN'),
            nhan_vien: taiXe || 'Thợ trạm',
            che_do: 'Tự động',
            bien_so: bienSo || '',
            sl_me: slMe || 0,
            file_name: path.basename(filePath)
        };
    } catch (err) {
        console.error('Lỗi phân tích file CaXe:', err.message);
        return null;
    }
}

/**
 * Bóc tách file chi tiết xe Ghi_CTXe_...xls (phiếu từng mẻ)
 */
function parseCTXe(filePath) {
    try {
        const wb = XLSX.readFile(filePath);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let spx = '';
        let bienSo = '';
        let tongKg = 0;
        let mac = '';
        let soMe = 0;
        let ngaySx = '';

        for (let i = 0; i < Math.min(rows.length, 10); i++) {
            const r = rows[i] || [];
            for (let j = 0; j < r.length; j++) {
                const c = String(r[j] || '').trim();
                if (c.includes('Số phiếu:')) {
                    for (let k = j + 1; k < Math.min(j + 5, r.length); k++) {
                        if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') {
                            spx = String(r[k]).trim();
                            break;
                        }
                    }
                }
                if (c.includes('Biển số xe chở:')) {
                    for (let k = j + 1; k < Math.min(j + 4, r.length); k++) {
                        if (r[k] && String(r[k]).trim()) {
                            bienSo = String(r[k]).trim();
                            break;
                        }
                    }
                }
                if (c.includes('Tổng số mẻ:')) {
                    for (let k = j + 1; k < Math.min(j + 4, r.length); k++) {
                        if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') {
                            soMe = Number(r[k]) || 0;
                            break;
                        }
                    }
                }
                if (c.includes('Ngày Sản xuất:')) {
                    for (let k = j + 1; k < Math.min(j + 4, r.length); k++) {
                        if (r[k] !== undefined && r[k] !== null) {
                            ngaySx = String(r[k]).trim();
                            break;
                        }
                    }
                }
            }
        }

        // Bóc tách danh sách các mẻ (bắt đầu từ hàng 8)
        const batches = [];
        for (let i = 8; i < rows.length; i++) {
            const r = rows[i] || [];
            if (typeof r[0] === 'number') {
                const bMac = r[2] ? String(r[2]).trim() : (mac || '19');
                if (!mac) mac = bMac;

                const bCl1 = Number(r[3]) || 0;
                const bCl2 = Number(r[4]) || 0;
                const bCl3 = Number(r[5]) || 0;
                const bCl4 = Number(r[6]) || 0;
                const bCl5 = Number(r[7]) || 0;
                const bPg1 = Number(r[8]) || 0;
                const bPg2 = Number(r[9]) || 0;
                const bNhua = Number(r[10]) || 0;
                const bSbs = Number(r[11]) || 0;
                const bTham = Number(r[12]) || (bCl1 + bCl2 + bCl3 + bCl4 + bCl5 + bPg1 + bPg2 + bNhua + bSbs);

                batches.push({
                    me_stt: r[0],
                    thoi_gian: fractionToTime(r[1]),
                    mac: bMac,
                    cl1: Math.round(bCl1),
                    cl2: Math.round(bCl2),
                    cl3: Math.round(bCl3),
                    cl4: Math.round(bCl4),
                    cl5: Math.round(bCl5),
                    pg1: Math.round(bPg1 * 10) / 10,
                    pg2: Math.round(bPg2 * 10) / 10,
                    nhua: Math.round(bNhua * 10) / 10,
                    sbs: Math.round(bSbs * 100) / 100,
                    tham_kg: Math.round(bTham)
                });
            } else if (r.length > 0) {
                // Kiểm tra dòng Tổng(kg)
                for (let k = 0; k < r.length; k++) {
                    if (String(r[k] || '').includes('Tổng(kg)')) {
                        const val = Number(r[k + 1]);
                        if (!isNaN(val) && val > 0) {
                            tongKg = val;
                        }
                    }
                }
            }
        }

        // Nếu chưa có tổng kg từ dòng footer, tính tổng các mẻ
        if (tongKg === 0 && batches.length > 0) {
            tongKg = batches.reduce((sum, b) => sum + b.tham_kg, 0);
        }

        let spxStr = '';
        if (spx !== '') {
            const num = parseInt(spx);
            spxStr = !isNaN(num) ? 'SPX' + String(num).padStart(3, '0') : String(spx);
        } else {
            spxStr = 'SPX_' + Date.now().toString().slice(-4);
        }

        const m3xe = tongKg > 0 ? (tongKg / 2400).toFixed(1) : '0.0';

        // Lấy biển số từ tên file nếu trong bảng chưa có (vd Ghi_CTXe_12345.xls -> 12345)
        if (!bienSo) {
            const m = path.basename(filePath).match(/Ghi_CTXe_([^\.]+)\.xls/i);
            if (m && m[1]) bienSo = m[1].trim();
        }

        return {
            id: spxStr + '_' + Date.now(),
            spx: spxStr,
            bien_so: bienSo || '12345',
            ma_kh: 'KH_LE',
            ten_kh: 'Khách lẻ',
            thoi_gian: new Date().toLocaleString('vi-VN'),
            mac: mac || '19',
            m3xe: m3xe,
            m3_raw: parseFloat(m3xe),
            khoi_luong: Math.round(tongKg).toLocaleString('vi-VN'),
            kg_raw: tongKg,
            so_me: soMe || batches.length,
            batches: batches,
            nhan_vien: 'Vận hành trạm',
            che_do: 'Tự động',
            file_name: path.basename(filePath)
        };
    } catch (err) {
        console.error('Lỗi phân tích file CTXe:', err.message);
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

        let soXe = 0;
        let totalMe = 0;
        let tongKg = 0;
        const vehicleMap = {};

        // Hàng 5: Số lượng xe chở
        if (rows[5]) {
            for (let j = 0; j < rows[5].length; j++) {
                if (String(rows[5][j] || '').includes('Số lượng xe chở:')) {
                    soXe = Number(rows[5][j + 2] || rows[5][j + 1]) || 0;
                }
            }
        }

        for (let i = 8; i < rows.length; i++) {
            const r = rows[i] || [];
            if (typeof r[0] === 'number') {
                totalMe++;
                const thamKg = Number(r[12]) || 0;
                tongKg += thamKg;
                const bs = String(r[16] || '').trim();
                if (bs) {
                    vehicleMap[bs] = (vehicleMap[bs] || 0) + thamKg;
                }
            }
        }

        return {
            soXe: soXe || Object.keys(vehicleMap).length,
            totalMe,
            tongKg,
            tongM3: (tongKg / 2400).toFixed(1),
            vehicles: vehicleMap
        };
    } catch (err) {
        console.error('Lỗi phân tích file CTNgay:', err.message);
        return null;
    }
}

module.exports = { parseCaXe, parseCTXe, parseCTNgay, fractionToTime };
