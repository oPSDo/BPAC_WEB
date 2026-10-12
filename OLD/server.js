const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.BPAC_API_KEY || 'BPAC_SECRET_KEY_2026';

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình Multer để lưu file tạm rồi chuyển vào thư mục chuẩn
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(UPLOADS_DIR, '_temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// 1. Health check & Ping
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 2. API Upload từ autoupdate.exe
app.post('/api/upload', upload.single('file'), (req, res) => {
  const clientKey = req.headers['x-api-key'] || req.query.apiKey;
  if (clientKey !== API_KEY) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file received' });
  }

  const station = (req.body.station || 'BPAC_Tram_01').replace(/[^a-zA-Z0-9_-]/g, '_');
  const folder = (req.body.folder || 'root').replace(/[^a-zA-Z0-9_-]/g, '_');
  const originalName = req.file.originalname;

  const targetDir = path.join(UPLOADS_DIR, station, folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetPath = path.join(targetDir, originalName);
  fs.rename(req.file.path, targetPath, (err) => {
    if (err) {
      console.error('Lỗi khi lưu file:', err);
      return res.status(500).json({ error: 'Failed to save file' });
    }

    console.log(`[${new Date().toLocaleTimeString()}] Nhận file thành công: [${station}] ${folder}/${originalName} (${req.file.size} bytes)`);
    res.json({
      success: true,
      station,
      folder,
      fileName: originalName,
      size: req.file.size,
      time: new Date().toISOString()
    });
  });
});

// 3. API lấy danh sách các ngày
app.get('/api/dates', (req, res) => {
  const station = (req.query.station || 'BPAC_Tram_01').replace(/[^a-zA-Z0-9_-]/g, '_');
  const stationDir = path.join(UPLOADS_DIR, station);

  if (!fs.existsSync(stationDir)) {
    return res.json({ dates: [], station });
  }

  try {
    const entries = fs.readdirSync(stationDir, { withFileTypes: true });
    const dates = entries
      .filter(e => e.isDirectory() && /^\d{4}_\d{2}_\d{2}$/.test(e.name))
      .map(e => e.name)
      .sort()
      .reverse(); // Mới nhất lên đầu

    res.json({ dates, station });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi đọc thư mục trạm' });
  }
});

// 4. API lấy dữ liệu chi tiết của một ngày
app.get('/api/day-data', (req, res) => {
  const station = (req.query.station || 'BPAC_Tram_01').replace(/[^a-zA-Z0-9_-]/g, '_');
  const date = (req.query.date || '').replace(/[^a-zA-Z0-9_-]/g, '_');

  if (!date) {
    return res.status(400).json({ error: 'Thiếu tham số date' });
  }

  const dayDir = path.join(UPLOADS_DIR, station, date);
  if (!fs.existsSync(dayDir)) {
    return res.json({ date, station, totalTrips: 0, summaryReports: {}, trips: [] });
  }

  try {
    const files = fs.readdirSync(dayDir);
    const summaryReports = {};
    const tripMap = {};

    let lastUpdatedTime = null;

    files.forEach(f => {
      const fullPath = path.join(dayDir, f);
      const stat = fs.statSync(fullPath);
      const mtime = stat.mtime;
      if (!lastUpdatedTime || mtime > lastUpdatedTime) {
        lastUpdatedTime = mtime;
      }

      const lower = f.toLowerCase();

      // Báo cáo tổng ngày và tổng xe
      if ((lower.startsWith('in_ct') || lower.startsWith('in ct') || lower.startsWith('in_chi')) && lower.endsWith('.pdf')) {
        if (lower.includes('xe')) {
          summaryReports.pdfDailyVehicle = { name: f, size: stat.size, mtime };
        } else {
          summaryReports.pdfDailySummary = { name: f, size: stat.size, mtime };
        }
      } else if ((lower.startsWith('ghi_ct') || lower.startsWith('ghi ct') || lower.startsWith('ghi_chi')) && lower.endsWith('.xls')) {
        if (lower.includes('xe')) {
          if (!summaryReports.xlsDailyVehicle || f.length > summaryReports.xlsDailyVehicle.name.length) {
            summaryReports.xlsDailyVehicle = { name: f, size: stat.size, mtime };
          }
        } else {
          summaryReports.xlsDailySummary = { name: f, size: stat.size, mtime };
        }
      }
      // Báo cáo từng ca xe: In_CaXe_...pdf, Ghi_CaXe_...xls
      else if (lower.startsWith('in_caxe_') || lower.startsWith('ghi_caxe_')) {
        // Tách chuỗi thời gian ví dụ: In_CaXe_10h_24m_22s.pdf -> 10h_24m_22s
        const match = f.match(/CaXe_(\d+h_\d+m_\d+s)/i);
        const timeKey = match ? match[1] : f;
        
        if (!tripMap[timeKey]) {
          // Định dạng giờ hiển thị
          let displayTime = timeKey;
          const tMatch = timeKey.match(/(\d+)h_(\d+)m_(\d+)s/);
          if (tMatch) {
            displayTime = `${tMatch[1].padStart(2, '0')}:${tMatch[2].padStart(2, '0')}:${tMatch[3].padStart(2, '0')}`;
          }

          tripMap[timeKey] = {
            id: timeKey,
            time: displayTime,
            pdfFile: null,
            xlsFile: null,
            updatedAt: mtime
          };
        }

        if (lower.endsWith('.pdf')) {
          tripMap[timeKey].pdfFile = { name: f, size: stat.size, mtime };
        } else if (lower.endsWith('.xls')) {
          tripMap[timeKey].xlsFile = { name: f, size: stat.size, mtime };
        }
      }
    });

    const trips = Object.values(tripMap).sort((a, b) => {
      // Sắp xếp thời gian giảm dần (mới nhất lên trên)
      return b.time.localeCompare(a.time);
    });

    res.json({
      date,
      station,
      lastUpdated: lastUpdatedTime ? lastUpdatedTime.toISOString() : null,
      totalTrips: trips.length,
      summaryReports,
      trips
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi đọc dữ liệu ngày' });
  }
});

// 5. API Xem hoặc Tải file
app.get('/api/file', (req, res) => {
  const station = (req.query.station || 'BPAC_Tram_01').replace(/[^a-zA-Z0-9_-]/g, '_');
  const date = (req.query.date || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = path.basename(req.query.file || '');
  const download = req.query.download === 'true';

  if (!date || !filename) {
    return res.status(400).send('Thiếu tham số');
  }

  const filePath = path.join(UPLOADS_DIR, station, date, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Không tìm thấy file');
  }

  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf' && !download) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
  } else if (ext === '.xls') {
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  }

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`   BPAC Web Dashboard Server is running!`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   API Key: ${API_KEY}`);
  console.log(`=======================================================`);
});
