const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseCaXe, parseCTNgay } = require('../services/excelParser');
const { addOrder, loadData } = require('../services/dataStore');

// Cấu hình lưu trữ file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const station = (req.body.station || 'BPAC_Tram_01').replace(/[^a-zA-Z0-9_-]/g, '_');
        const folder = (req.body.folder || new Date().toISOString().split('T')[0]).replace(/[^a-zA-Z0-9_-]/g, '_');
        const uploadDir = path.join(__dirname, '..', 'uploads', station, folder);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Giữ nguyên tên file từ Siemens
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // Tối đa 50MB
});

// Middleware xác thực API Key
const API_SECRET_KEY = process.env.API_KEY || 'BPAC_SECRET_KEY_2026';

function verifyApiKey(req, res, next) {
    const key = req.headers['x-api-key'] || req.body.apiKey || req.query.apiKey;
    if (!key || key !== API_SECRET_KEY) {
        return res.status(401).json({ success: false, message: 'Invalid or missing API Key' });
    }
    next();
}

// ==================== POST /api/upload ====================
// Nhận file tự động từ autoupdate.exe trên máy trạm Siemens
router.post('/upload', verifyApiKey, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;
        console.log(`📥 Nhận file từ trạm: ${fileName} (${req.file.size} bytes)`);

        let parseResult = null;

        // Nếu là file chuyến xe Ghi_CaXe_...xls
        if (fileName.toLowerCase().startsWith('ghi_caxe_') && fileName.toLowerCase().endsWith('.xls')) {
            parseResult = parseCaXe(filePath);
            if (parseResult) {
                addOrder(parseResult);
                console.log(`✅ Đã bóc tách thành công phiếu: ${parseResult.spx} - Khách: ${parseResult.ten_kh} (${parseResult.m3xe} m³)`);
            }
        }
        // Nếu là file tổng hợp Ghi_CT Ngày_...xls
        else if (fileName.toLowerCase().startsWith('ghi_ct ngày_') && fileName.toLowerCase().endsWith('.xls')) {
            const ctResult = parseCTNgay(filePath);
            console.log(`📊 Đã nhận file tổng kết ngày: ${JSON.stringify(ctResult)}`);
        }

        res.json({
            success: true,
            message: 'File uploaded and processed successfully',
            file: fileName,
            order: parseResult
        });

    } catch (err) {
        console.error('Lỗi tiếp nhận file upload:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==================== GET /api/status ====================
router.get('/status', (req, res) => {
    const data = loadData();
    res.json({
        success: true,
        stats: data.stats,
        totalOrders: data.orders.length,
        lastUpdated: data.lastUpdated
    });
});

module.exports = router;
