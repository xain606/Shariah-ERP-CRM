# QistBazaar - WAMP Server & cPanel Hosting Deployment Guide

This project is built as an **offline-first PWA Single Page Application with a lightweight PHP (PDO) and MySQL REST backend**. It is completely compatible with standard **WAMP Server (Windows)** and **cPanel Shared Hosting (Apache + PHP 7.4/8.x + MySQL/MariaDB)**.

---

## 1. Quick WAMP Server Deployment (Localhost / Shop LAN)

### Prerequisites:
- Install **WampServer** (64-bit) from [wampserver.com](https://www.wampserver.com/)
- Ensure WampServer tray icon turns **Green** (Apache & MySQL services running)

### Steps:
1. **Copy App Files:**
   - Create a folder inside your WAMP `www` directory:
     ```
     C:\wamp64\www\qistbazaar\
     ```
   - Copy everything from the `dist/` directory (or the project root) into `C:\wamp64\www\qistbazaar\`.

2. **Import the MySQL Database in phpMyAdmin:**
   - Open your browser: `http://localhost/phpmyadmin`
   - Log in with username `root` (password is blank by default).
   - Click **New** -> Create database name: `qistbazaar_db` with Collation `utf8mb4_unicode_ci`.
   - Click on `qistbazaar_db` -> Click **Import** tab -> Select `database.sql`.
   - Click **Go**. All 8 tables and sample Pakistani contracts will be created.

3. **Verify Database Configuration:**
   - Open `C:\wamp64\www\qistbazaar\api\db.php` in Notepad.
   - Verify the default credentials:
     ```php
     $DB_HOST = 'localhost';
     $DB_NAME = 'qistbazaar_db';
     $DB_USER = 'root';
     $DB_PASS = ''; // Leave blank on default WAMP
     ```

4. **Test & Open:**
   - Open: `http://localhost/qistbazaar/api/test_db.php` (Checks database connection)
   - Open: `http://localhost/qistbazaar/` (Full application)

5. **Shop LAN Access (for Salesmen & Recovery Officers on Mobile Phones):**
   - Find your computer's local IP via Command Prompt (`ipconfig`), e.g., `192.168.1.50`.
   - On mobile connected to the shop Wi-Fi: open `http://192.168.1.50/qistbazaar`.

---

## 2. cPanel Shared Hosting Deployment (Public Domain / Subdomain)

### Steps:
1. **Create MySQL Database & User in cPanel:**
   - Log into your cPanel account.
   - Click **MySQL Database Wizard**:
     - Database Name: `cpaneluser_qistdb`
     - Username: `cpaneluser_qistadmin`
     - Password: Choose a strong password (e.g., `QistPass2026!#`)
     - Privileges: Check **ALL PRIVILEGES** -> Click **Make Changes**.

2. **Import Database in cPanel phpMyAdmin:**
   - In cPanel, click **phpMyAdmin**.
   - Select your database (`cpaneluser_qistdb`).
   - Click **Import** -> Choose `database.sql` -> Click **Go**.

3. **Upload Files via cPanel File Manager:**
   - In cPanel, click **File Manager** -> Open `public_html/` (or your subdomain directory, e.g. `public_html/qist/`).
   - Upload the files from `dist/` (including `.htaccess`, `index.html`, `assets/`, `api/`, `manifest.json`, and `sw.js`).
   - *Tip:* Make sure hidden files (`.htaccess`) are enabled in File Manager Settings.

4. **Update Database Credentials:**
   - Edit `api/db.php` via cPanel File Manager Code Editor:
     ```php
     $DB_HOST = 'localhost';
     $DB_NAME = 'cpaneluser_qistdb';
     $DB_USER = 'cpaneluser_qistadmin';
     $DB_PASS = 'QistPass2026!#';
     ```

5. **Issue Free SSL (Let's Encrypt / AutoSSL):**
   - In cPanel, navigate to **SSL/TLS Status** -> Click **Run AutoSSL**.
   - *Why this is needed:* Progressive Web Apps (PWAs) and Service Workers require HTTPS to store offline data in IndexedDB and enable "Add to Home Screen" on Android devices.

6. **Verify Diagnostics:**
   - Open `https://yourdomain.com/api/test_db.php` to verify everything is operational.

---

## 3. Offline-First Field Recovery Architecture

When recovery officers ride motorbikes to collect cash in basements or remote rural zones without cellular internet:
- **Local Outbox Storage:** Payments and customer signatures are signed with unique client UUIDs and saved into the browser's **IndexedDB** (`QistBazaar_Offline_v1`).
- **Immediate Thermal Slips:** The officer generates 80mm receipts via portable Bluetooth ESC/POS printers on the spot.
- **Deduplicated Sync:** When the officer connects to 4G or head office Wi-Fi, the app batches pending receipts to `/api/sync.php`. The PHP script uses transactions and idempotency keys to update contracts, installment schedules, and daily cash-in-hand without duplicate entries.
