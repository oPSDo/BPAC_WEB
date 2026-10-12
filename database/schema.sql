-- ============================================================
-- Script tạo database cho hệ thống TrạmTrộn Web
-- Chạy trong Botkeep → MySQL service → SQL Editor/phpMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS tramtron_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tramtron_db;

-- ===== BẢNG USERS =====
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    fullname    VARCHAR(100) NOT NULL,
    role        ENUM('admin','operator','viewer') NOT NULL DEFAULT 'operator',
    tram        VARCHAR(100) DEFAULT 'Trạm chính',
    active      TINYINT(1) NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tài khoản demo: admindemo / 123456 (bcrypt hash)
INSERT IGNORE INTO users (username, password, fullname, role, tram) VALUES
('admindemo', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Quản trị viên Demo', 'admin', 'Trạm Demo');

-- ===== BẢNG ĐƠN HÀNG =====
CREATE TABLE IF NOT EXISTS orders (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    order_code    VARCHAR(20) UNIQUE NOT NULL,
    customer      VARCHAR(100) NOT NULL,
    concrete_type VARCHAR(20) NOT NULL,
    volume_m3     DECIMAL(10,2) NOT NULL,
    status        ENUM('pending','producing','delivering','done','cancelled') DEFAULT 'pending',
    created_by    INT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
