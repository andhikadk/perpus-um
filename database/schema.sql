-- ============================================
-- Library Membership System Database Schema
-- ============================================

USE joki_balqis_library_app;

-- ============================================
-- Table: admins (Pustakawan/Admin)
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email (email)
);

-- ============================================
-- Table: members (Anggota Perpustakaan)
-- ============================================
CREATE TABLE IF NOT EXISTS members (
  id INT PRIMARY KEY AUTO_INCREMENT,

  -- Personal Info
  name VARCHAR(100) NOT NULL,
  nim VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  birth_place VARCHAR(100),
  birth_date DATE,
  gender ENUM('male', 'female'),
  address TEXT,
  phone VARCHAR(20),

  -- Institution Info
  institution VARCHAR(100),
  profession VARCHAR(100),
  program VARCHAR(100),

  -- Files
  photo_path VARCHAR(255),
  signature_path VARCHAR(255),
  payment_proof_path VARCHAR(255),

  -- Status
  registration_date DATE,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_at TIMESTAMP NULL,
  rejected_at TIMESTAMP NULL,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes
  KEY idx_nim (nim),
  KEY idx_email (email),
  KEY idx_status (status),
  KEY idx_registration_date (registration_date)
);

-- ============================================
-- Table: renewals (Perpanjangan Keanggotaan)
-- ============================================
CREATE TABLE IF NOT EXISTS renewals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  request_date DATE,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_at TIMESTAMP NULL,
  new_expiry_date DATE,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  KEY idx_member_id (member_id),
  KEY idx_status (status)
);

-- ============================================
-- Table: audit_logs (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT,
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id INT,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  KEY idx_action (action),
  KEY idx_entity (entity_type, entity_id),
  KEY idx_created_at (created_at)
);

-- ============================================
-- Default Admin Account
-- ============================================
INSERT INTO admins (email, password, name, role)
VALUES ('admin@gmail.com', 'admin', 'Admin Perpustakaan', 'admin')
ON DUPLICATE KEY UPDATE email=email;
