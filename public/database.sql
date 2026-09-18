-- ==============================================================================
-- QistBazaar - Pakistan Installment ERP & Recovery CRM Database Schema
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+ (WAMP / cPanel phpMyAdmin)
-- Character Set: utf8mb4 (Full Urdu & English Support)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `recovery_payments`;
DROP TABLE IF EXISTS `installment_schedules`;
DROP TABLE IF EXISTS `installment_contracts`;
DROP TABLE IF EXISTS `inventory_items`;
DROP TABLE IF EXISTS `guarantors`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `recovery_officers`;
DROP TABLE IF EXISTS `offline_sync_log`;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. Table: Customers (Pakistani CNIC, Residential Status, Electricity Ref)
-- ------------------------------------------------------------------------------
CREATE TABLE `customers` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `father_name` VARCHAR(150) NOT NULL,
  `cnic` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Pakistani CNIC e.g. 35202-1234567-1',
  `mobile` VARCHAR(20) NOT NULL,
  `alternate_mobile` VARCHAR(20) DEFAULT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(80) NOT NULL DEFAULT 'Lahore',
  `residential_type` ENUM('owned', 'rented') NOT NULL DEFAULT 'owned' COMMENT 'ذاتی مکان یا کرایہ دار',
  `electricity_ref_no` VARCHAR(60) DEFAULT NULL COMMENT 'LESCO, K-Electric, IESCO Consumer Ref',
  `occupation` VARCHAR(120) NOT NULL,
  `monthly_income` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `verisys_status` ENUM('verified', 'pending', 'flagged') NOT NULL DEFAULT 'verified',
  `risk_score` ENUM('Low Risk', 'Medium Risk', 'High Risk', 'Defaulter') NOT NULL DEFAULT 'Low Risk',
  `doc_cnic_front` TINYINT(1) NOT NULL DEFAULT 1,
  `doc_cnic_back` TINYINT(1) NOT NULL DEFAULT 1,
  `doc_utility_bill` TINYINT(1) NOT NULL DEFAULT 1,
  `doc_salary_slip` TINYINT(1) NOT NULL DEFAULT 0,
  `doc_security_cheque` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: Guarantors (Zamin 1 & 2 - ضامن اول و دوم)
-- ------------------------------------------------------------------------------
CREATE TABLE `guarantors` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `customer_id` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `father_name` VARCHAR(150) NOT NULL,
  `cnic` VARCHAR(20) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `relationship` VARCHAR(80) NOT NULL COMMENT 'e.g. Brother, Uncle, Colleague',
  `address` TEXT NOT NULL,
  `workplace` VARCHAR(150) DEFAULT NULL,
  `verisys_status` ENUM('verified', 'pending', 'flagged') NOT NULL DEFAULT 'verified',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: Inventory Items (Smartphones, Motorcycles, Home Appliances)
-- ------------------------------------------------------------------------------
CREATE TABLE `inventory_items` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `category` ENUM('Smartphones', 'Motorcycles', 'Home Appliances', 'Solar Energy', 'Laptops & IT') NOT NULL,
  `brand` VARCHAR(80) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `cash_price` DECIMAL(12,2) NOT NULL,
  `cost_price` DECIMAL(12,2) NOT NULL,
  `serial_or_imei` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Primary IMEI or Bike Engine No',
  `secondary_imei_or_chassis` VARCHAR(100) DEFAULT NULL COMMENT 'Secondary IMEI or Bike Chassis No',
  `status` ENUM('In Stock', 'Contract Assigned', 'Repossessed') NOT NULL DEFAULT 'In Stock',
  `contract_id` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: Recovery Officers (Field Agents with Cash in Hand)
-- ------------------------------------------------------------------------------
CREATE TABLE `recovery_officers` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `assigned_zone` VARCHAR(100) NOT NULL,
  `target_monthly` DECIMAL(12,2) NOT NULL DEFAULT 500000.00,
  `collected_this_month` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `cash_in_hand_today` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: Installment Contracts (Murabaha Installment Agreement)
-- ------------------------------------------------------------------------------
CREATE TABLE `installment_contracts` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'e.g. PK-QIST-2026-001',
  `customer_id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_cnic` VARCHAR(20) NOT NULL,
  `customer_mobile` VARCHAR(20) NOT NULL,
  `customer_city` VARCHAR(80) NOT NULL DEFAULT 'Lahore',
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `serial_or_imei` VARCHAR(100) NOT NULL,
  `cash_price` DECIMAL(12,2) NOT NULL,
  `markup_percentage` DECIMAL(5,2) NOT NULL,
  `total_contract_price` DECIMAL(12,2) NOT NULL,
  `advance_paid` DECIMAL(12,2) NOT NULL,
  `file_charges` DECIMAL(10,2) NOT NULL DEFAULT 2000.00,
  `remaining_balance` DECIMAL(12,2) NOT NULL,
  `tenure_months` INT NOT NULL,
  `monthly_installment` DECIMAL(12,2) NOT NULL,
  `start_date` DATE NOT NULL,
  `due_day_of_month` INT NOT NULL DEFAULT 10,
  `status` ENUM('active', 'completed', 'defaulter', 'legal_action', 'repossessed') NOT NULL DEFAULT 'active',
  `recovery_officer_id` VARCHAR(50) NOT NULL,
  `recovery_officer_name` VARCHAR(120) NOT NULL,
  `security_cheque_no` VARCHAR(60) DEFAULT NULL COMMENT 'Sec 489-F PPC Undated Cheque',
  `bank_name` VARCHAR(100) DEFAULT NULL,
  `stamp_paper_no` VARCHAR(60) DEFAULT NULL COMMENT 'Non-Judicial Iqrarnama Serial',
  `original_file_held` TINYINT(1) NOT NULL DEFAULT 0,
  `imei_remote_locked` TINYINT(1) NOT NULL DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `inventory_items` (`id`),
  FOREIGN KEY (`recovery_officer_id`) REFERENCES `recovery_officers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Table: Installment Schedules (Monthly Breakdown)
-- ------------------------------------------------------------------------------
CREATE TABLE `installment_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `contract_id` VARCHAR(50) NOT NULL,
  `installment_no` INT NOT NULL,
  `due_date` DATE NOT NULL,
  `amount_due` DECIMAL(12,2) NOT NULL,
  `late_fine` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `amount_paid` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `paid_date` DATE DEFAULT NULL,
  `payment_method` ENUM('Cash', 'JazzCash', 'EasyPaisa', 'Raast', 'Bank Transfer') DEFAULT NULL,
  `transaction_ref` VARCHAR(100) DEFAULT NULL,
  `receipt_no` VARCHAR(60) DEFAULT NULL,
  `collected_by` VARCHAR(120) DEFAULT NULL,
  `status` ENUM('pending', 'due', 'paid', 'overdue', 'partial') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (`contract_id`) REFERENCES `installment_contracts` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_contract_month` (`contract_id`, `installment_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Table: Recovery Payments & Offline Sync Ledger (Idempotent De-duplication)
-- ------------------------------------------------------------------------------
CREATE TABLE `recovery_payments` (
  `id` VARCHAR(60) NOT NULL PRIMARY KEY COMMENT 'Client UUID (Idempotency Key to prevent double payments)',
  `contract_id` VARCHAR(50) NOT NULL,
  `installment_no` INT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_method` ENUM('Cash', 'JazzCash', 'EasyPaisa', 'Raast', 'Bank Transfer') NOT NULL DEFAULT 'Cash',
  `transaction_ref` VARCHAR(100) DEFAULT NULL,
  `receipt_no` VARCHAR(60) NOT NULL,
  `recovery_officer_name` VARCHAR(120) NOT NULL,
  `collected_offline` TINYINT(1) NOT NULL DEFAULT 0,
  `collected_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `synced_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gps_lat` DECIMAL(10,8) DEFAULT NULL,
  `gps_lng` DECIMAL(11,8) DEFAULT NULL,
  FOREIGN KEY (`contract_id`) REFERENCES `installment_contracts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Table: Offline Sync Batch Audit Log
-- ------------------------------------------------------------------------------
CREATE TABLE `offline_sync_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `batch_id` VARCHAR(60) NOT NULL,
  `officer_name` VARCHAR(120) NOT NULL,
  `total_records` INT NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `sync_timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_ip` VARCHAR(45) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- SAMPLE SEED DATA (Ready for Instant Use in WAMP or cPanel)
-- ==============================================================================

-- Recovery Officers
INSERT INTO `recovery_officers` (`id`, `name`, `phone`, `assigned_zone`, `target_monthly`, `collected_this_month`, `cash_in_hand_today`, `status`) VALUES
('OFF-001', 'Muhammad Rizwan', '0301-4455667', 'Zone A - Gulberg & Cantt Lahore', 650000.00, 312000.00, 42000.00, 'active'),
('OFF-002', 'Hafiz Tariq Mehmood', '0321-7788990', 'Zone B - Shahdara & Badami Bagh', 550000.00, 248000.00, 28000.00, 'active'),
('OFF-003', 'Zain Ul Abideen', '0333-1122334', 'Zone C - Johar Town & Wapda Town', 700000.00, 410000.00, 56000.00, 'active');

-- Customers
INSERT INTO `customers` (`id`, `full_name`, `father_name`, `cnic`, `mobile`, `address`, `city`, `residential_type`, `electricity_ref_no`, `occupation`, `monthly_income`, `verisys_status`, `risk_score`) VALUES
('CUST-001', 'Muhammad Salman Khan', 'Abdul Qayyum Khan', '35202-8921094-3', '0300-4123456', 'House # 42, Street 8, Mohalla Nizamabad, Kot Lakhpat', 'Lahore', 'owned', 'LESCO-08-11542-892011', 'Senior Accountant, Packages Ltd', 85000.00, 'verified', 'Low Risk'),
('CUST-002', 'Sheikh Usman Farooq', 'Sheikh Farooq Ahmad', '35201-4458921-7', '0322-8877123', 'Flat 4B, Al-Madina Heights, Link Road Model Town', 'Lahore', 'rented', 'LESCO-12-89021-445892', 'Wholesale Cloth Merchant, Azam Cloth Market', 120000.00, 'verified', 'Low Risk'),
('CUST-003', 'Rana Bilal Hussain', 'Rana Zulfiqar Ali', '35202-6712093-5', '0345-9988112', 'Chah Miran, Misri Shah near Railway Workshop', 'Lahore', 'rented', 'LESCO-04-33120-778901', 'Auto Electrician Mechanic', 48000.00, 'verified', 'High Risk');

-- Guarantors (2 per customer)
INSERT INTO `guarantors` (`id`, `customer_id`, `full_name`, `father_name`, `cnic`, `mobile`, `relationship`, `address`, `workplace`) VALUES
('GUA-001-A', 'CUST-001', 'Haji Abdul Rasheed', 'Mian Ghulam Nabi', '35202-1102938-1', '0301-9988776', 'Paternal Uncle (چچا)', 'Main Bazaar Kot Lakhpat', 'Rasheed Kiryana Merchant'),
('GUA-001-B', 'CUST-001', 'Shahid Mehmood Butt', 'Akram Butt', '35202-5566778-9', '0321-4433221', 'Colleague (ساتھی ملازم)', 'Township Sector B-1', 'Packages Ltd Factory'),
('GUA-002-A', 'CUST-002', 'Sheikh Tariq Javed', 'Sheikh Javed Iqbal', '35201-9988776-5', '0321-5566778', 'Real Brother (سگا بھائی)', 'Model Town Extension', 'Javed Cloth House'),
('GUA-002-B', 'CUST-002', 'Chaudhry Nadeem Akhtar', 'Akhtar Ali', '35201-3322114-7', '0300-7766554', 'Business Partner', 'Gulberg III Main Boulevard', 'Al-Nadeem Fabrics');

-- Inventory
INSERT INTO `inventory_items` (`id`, `name`, `category`, `brand`, `model`, `cash_price`, `cost_price`, `serial_or_imei`, `secondary_imei_or_chassis`, `status`) VALUES
('PROD-001', 'Atlas Honda CD-70 Dream (2026 Model)', 'Motorcycles', 'Honda', 'CD70-2026', 157900.00, 142000.00, 'ENG-CD70-984210', 'CHS-AHL-2026-9842', 'Contract Assigned'),
('PROD-002', 'Samsung Galaxy A55 5G (8GB/256GB Awesome Navy)', 'Smartphones', 'Samsung', 'SM-A556E', 134999.00, 118000.00, '359182049182741', '359182049182742', 'Contract Assigned'),
('PROD-003', 'Dawlance 1.5 Ton Chrome Inverter AC (Heat & Cool)', 'Home Appliances', 'Dawlance', 'Chrome-15Inverter', 165000.00, 145000.00, 'COMP-DW-99120489', 'SN-CHROME-2026-08', 'Contract Assigned'),
('PROD-004', 'Inverex Solar Inverter 3.2 KW Aerox V2', 'Solar Energy', 'Inverex', 'Aerox-3.2KW', 145000.00, 128000.00, 'INV-AEROX-2026-1120', NULL, 'In Stock'),
('PROD-005', 'Yamaha YBR 125G (Metallic Black)', 'Motorcycles', 'Yamaha', 'YBR-125G', 485000.00, 440000.00, 'ENG-YBR-4489201', 'CHS-YM-2026-4489', 'In Stock');

-- Installment Contracts
INSERT INTO `installment_contracts` (`id`, `customer_id`, `customer_name`, `customer_cnic`, `customer_mobile`, `customer_city`, `product_id`, `product_name`, `category`, `serial_or_imei`, `cash_price`, `markup_percentage`, `total_contract_price`, `advance_paid`, `file_charges`, `remaining_balance`, `tenure_months`, `monthly_installment`, `start_date`, `due_day_of_month`, `status`, `recovery_officer_id`, `recovery_officer_name`, `security_cheque_no`, `bank_name`, `stamp_paper_no`, `original_file_held`, `imei_remote_locked`, `notes`) VALUES
('PK-QIST-2026-001', 'CUST-001', 'Muhammad Salman Khan', '35202-8921094-3', '0300-4123456', 'Lahore', 'PROD-001', 'Atlas Honda CD-70 Dream (2026 Model)', 'Motorcycles', 'ENG-CD70-984210', 157900.00, 35.00, 213165.00, 45000.00, 2000.00, 140138.00, 12, 14014.00, '2026-01-10', 10, 'active', 'OFF-001', 'Muhammad Rizwan', 'CHK-MEZ-889021', 'Meezan Bank Ltd', 'PB-STAMP-2026-99201', 1, 0, 'Original registration file kept in head office safe locker. 2 months paid punctually.'),
('PK-QIST-2026-002', 'CUST-002', 'Sheikh Usman Farooq', '35201-4458921-7', '0322-8877123', 'Lahore', 'PROD-002', 'Samsung Galaxy A55 5G (8GB/256GB Awesome Navy)', 'Smartphones', '359182049182741', 134999.00, 30.00, 175498.00, 35000.00, 2000.00, 117082.00, 12, 11708.00, '2026-02-05', 5, 'active', 'OFF-003', 'Zain Ul Abideen', 'CHK-HBL-112903', 'Habib Bank Ltd (HBL)', 'PB-STAMP-2026-11892', 0, 0, 'Samsung Knox Guard cloud MDM active. 48hr lock threshold on payment delay.'),
('PK-QIST-2026-003', 'CUST-003', 'Rana Bilal Hussain', '35202-6712093-5', '0345-9988112', 'Lahore', 'PROD-003', 'Dawlance 1.5 Ton Chrome Inverter AC (Heat & Cool)', 'Home Appliances', 'COMP-DW-99120489', 165000.00, 40.00, 231000.00, 35000.00, 2000.00, 196000.00, 12, 16333.00, '2026-01-15', 15, 'defaulter', 'OFF-002', 'Hafiz Tariq Mehmood', 'CHK-UBL-992011', 'United Bank Ltd (UBL)', 'PB-STAMP-2026-44891', 0, 0, 'Overdue since 60 days. Security cheque presented, bounced with memo. Sec 489-F PPC advocate notice sent.');

-- Installment Schedules
INSERT INTO `installment_schedules` (`contract_id`, `installment_no`, `due_date`, `amount_due`, `late_fine`, `amount_paid`, `paid_date`, `payment_method`, `transaction_ref`, `receipt_no`, `collected_by`, `status`) VALUES
('PK-QIST-2026-001', 1, '2026-02-10', 14014.00, 0.00, 14014.00, '2026-02-08', 'Cash', NULL, 'REC-2026-1001', 'Muhammad Rizwan', 'paid'),
('PK-QIST-2026-001', 2, '2026-03-10', 14014.00, 0.00, 14014.00, '2026-03-09', 'JazzCash', 'JC-88219034', 'REC-2026-1045', 'Muhammad Rizwan', 'paid'),
('PK-QIST-2026-001', 3, '2026-04-10', 14014.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 'due'),
('PK-QIST-2026-001', 4, '2026-05-10', 14014.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 'pending'),
('PK-QIST-2026-002', 1, '2026-03-05', 11708.00, 0.00, 11708.00, '2026-03-04', 'Raast', 'RAAST-PK-99120', 'REC-2026-1089', 'Zain Ul Abideen', 'paid'),
('PK-QIST-2026-002', 2, '2026-04-05', 11708.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 'due'),
('PK-QIST-2026-003', 1, '2026-02-15', 16333.00, 0.00, 16333.00, '2026-02-14', 'Cash', NULL, 'REC-2026-1012', 'Hafiz Tariq Mehmood', 'paid'),
('PK-QIST-2026-003', 2, '2026-03-15', 16333.00, 500.00, 0.00, NULL, NULL, NULL, NULL, NULL, 'overdue');
