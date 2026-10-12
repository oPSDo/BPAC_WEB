const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || '37.187.29.146',
    user: process.env.DB_USER || 'botkeep',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'app',
    port: parseInt(process.env.DB_PORT, 10) || 36318,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 3000, // Tối đa 3 giây nếu không kết nối được
    charset: 'utf8mb4',
    ssl: { rejectUnauthorized: false }
});

// Kiểm tra kết nối khi khởi động
pool.getConnection()
    .then(conn => {
        console.log('✅ Kết nối MariaDB Botkeep thành công!');
        conn.release();
    })
    .catch(err => {
        console.warn('⚠️  MariaDB Botkeep:', err.message);
        console.warn('   Hệ thống dùng chế độ Demo fallback an toàn.');
    });

module.exports = pool;
