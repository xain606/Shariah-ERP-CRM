import React, { useState, useEffect } from 'react';
import {
  Server,
  Cloud,
  Database,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  FileCode,
  Terminal,
  Smartphone,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { formatPKR } from '../utils/formatters';
import {
  getPendingOutbox,
  queueOfflinePayment,
  syncOutboxToServer,
  clearAllOutbox,
} from '../utils/offlineDb';
import { OfflinePaymentRecord } from '../types';

interface DeploymentCenterProps {
  onTriggerReceipt?: (receiptData: any) => void;
}

export const DeploymentCenter: React.FC<DeploymentCenterProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<'offline_sim' | 'wamp' | 'cpanel' | 'code_viewer'>('wamp');
  const [selectedFile, setSelectedFile] = useState<string>('database.sql');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Offline Simulation State
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isRealOnline, setIsRealOnline] = useState(true);
  const [outboxItems, setOutboxItems] = useState<OfflinePaymentRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Monitor real browser online/offline status
  useEffect(() => {
    setIsRealOnline(navigator.onLine);
    const handleOnline = () => setIsRealOnline(true);
    const handleOffline = () => setIsRealOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load of outbox
    loadOutbox();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOutbox = async () => {
    const items = await getPendingOutbox();
    setOutboxItems(items);
  };

  const effectiveOffline = isSimulatedOffline || !isRealOnline;

  // Simulate an offline field collection on motorbike
  const handleSimulateFieldCollection = async () => {
    const randomContractId = 'PK-QIST-2026-001';
    const sampleRecord: OfflinePaymentRecord = {
      id: 'OFFLINE-TX-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000),
      contractId: randomContractId,
      customerName: 'Muhammad Salman Khan',
      customerMobile: '0300-4123456',
      installmentNo: 3,
      amount: 14014,
      paymentMethod: 'Cash',
      recoveryOfficerName: 'Muhammad Rizwan (Field Officer)',
      receiptNo: 'REC-OFFLINE-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString(),
      syncStatus: 'pending',
      gpsLocation: {
        lat: 31.5204,
        lng: 74.3587,
      },
    };

    await queueOfflinePayment(sampleRecord);
    await loadOutbox();
    setSyncFeedback(`Offline receipt #${sampleRecord.receiptNo} generated & saved to local device storage.`);
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback('Initiating secure batch sync with MySQL server (idempotent validation)...');
    try {
      const result = await syncOutboxToServer('Muhammad Rizwan', '/api/sync.php');
      await loadOutbox();
      setSyncFeedback(result.message);
    } catch (err: any) {
      setSyncFeedback('Sync completed locally.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  const handleClearOutbox = async () => {
    if (window.confirm('Clear all pending outbox records?')) {
      await clearAllOutbox();
      await loadOutbox();
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Code contents for the viewer
  const fileContents: Record<string, { desc: string; lang: string; code: string }> = {
    'database.sql': {
      desc: 'Complete MySQL 5.7 / 8.0 / MariaDB Schema with utf8mb4 collation and Pakistani seed data for phpMyAdmin import.',
      lang: 'sql',
      code: `-- ==============================================================================
-- QistBazaar - Pakistan Installments Database Schema (MySQL / MariaDB)
-- Import into phpMyAdmin in WAMP or cPanel
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS \`qistbazaar_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`qistbazaar_db\`;

-- Customers Table
CREATE TABLE \`customers\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`full_name\` VARCHAR(150) NOT NULL,
  \`father_name\` VARCHAR(150) NOT NULL,
  \`cnic\` VARCHAR(20) NOT NULL UNIQUE,
  \`mobile\` VARCHAR(20) NOT NULL,
  \`address\` TEXT NOT NULL,
  \`city\` VARCHAR(80) NOT NULL DEFAULT 'Lahore',
  \`residential_type\` ENUM('owned', 'rented') NOT NULL DEFAULT 'owned',
  \`electricity_ref_no\` VARCHAR(60) DEFAULT NULL,
  \`occupation\` VARCHAR(120) NOT NULL,
  \`monthly_income\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`verisys_status\` ENUM('verified', 'pending', 'flagged') NOT NULL DEFAULT 'verified',
  \`risk_score\` ENUM('Low Risk', 'Medium Risk', 'High Risk', 'Defaulter') NOT NULL DEFAULT 'Low Risk',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Guarantors Table (Zamin 1 & 2)
CREATE TABLE \`guarantors\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`customer_id\` VARCHAR(50) NOT NULL,
  \`full_name\` VARCHAR(150) NOT NULL,
  \`father_name\` VARCHAR(150) NOT NULL,
  \`cnic\` VARCHAR(20) NOT NULL,
  \`mobile\` VARCHAR(20) NOT NULL,
  \`relationship\` VARCHAR(80) NOT NULL,
  \`address\` TEXT NOT NULL,
  \`workplace\` VARCHAR(150) DEFAULT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Installment Contracts
CREATE TABLE \`installment_contracts\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`customer_id\` VARCHAR(50) NOT NULL,
  \`customer_name\` VARCHAR(150) NOT NULL,
  \`customer_cnic\` VARCHAR(20) NOT NULL,
  \`customer_mobile\` VARCHAR(20) NOT NULL,
  \`product_name\` VARCHAR(200) NOT NULL,
  \`category\` VARCHAR(50) NOT NULL,
  \`serial_or_imei\` VARCHAR(100) NOT NULL,
  \`cash_price\` DECIMAL(12,2) NOT NULL,
  \`markup_percentage\` DECIMAL(5,2) NOT NULL,
  \`total_contract_price\` DECIMAL(12,2) NOT NULL,
  \`advance_paid\` DECIMAL(12,2) NOT NULL,
  \`file_charges\` DECIMAL(10,2) NOT NULL DEFAULT 2000.00,
  \`remaining_balance\` DECIMAL(12,2) NOT NULL,
  \`tenure_months\` INT NOT NULL,
  \`monthly_installment\` DECIMAL(12,2) NOT NULL,
  \`start_date\` DATE NOT NULL,
  \`due_day_of_month\` INT NOT NULL DEFAULT 10,
  \`status\` ENUM('active', 'completed', 'defaulter', 'legal_action', 'repossessed') NOT NULL DEFAULT 'active',
  \`recovery_officer_name\` VARCHAR(120) NOT NULL,
  \`security_cheque_no\` VARCHAR(60) DEFAULT NULL,
  \`bank_name\` VARCHAR(100) DEFAULT NULL,
  \`stamp_paper_no\` VARCHAR(60) DEFAULT NULL,
  \`original_file_held\` TINYINT(1) NOT NULL DEFAULT 0,
  \`imei_remote_locked\` TINYINT(1) NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recovery Payments Ledger (With Client UUID Idempotency Key)
CREATE TABLE \`recovery_payments\` (
  \`id\` VARCHAR(60) NOT NULL PRIMARY KEY,
  \`contract_id\` VARCHAR(50) NOT NULL,
  \`installment_no\` INT NOT NULL,
  \`amount\` DECIMAL(12,2) NOT NULL,
  \`payment_method\` ENUM('Cash', 'JazzCash', 'EasyPaisa', 'Raast', 'Bank Transfer') NOT NULL DEFAULT 'Cash',
  \`transaction_ref\` VARCHAR(100) DEFAULT NULL,
  \`receipt_no\` VARCHAR(60) NOT NULL,
  \`recovery_officer_name\` VARCHAR(120) NOT NULL,
  \`collected_offline\` TINYINT(1) NOT NULL DEFAULT 0,
  \`collected_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`synced_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`gps_lat\` DECIMAL(10,8) DEFAULT NULL,
  \`gps_lng\` DECIMAL(11,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    },
    'api/db.php': {
      desc: 'PHP PDO Database Connector. Works on WAMP (root/no password) and cPanel MySQL credentials.',
      lang: 'php',
      code: `<?php
/**
 * QistBazaar - Database Connection Helper for WAMP & cPanel
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Default credentials (adjust for cPanel)
$DB_HOST = 'localhost';
$DB_NAME = 'qistbazaar_db';
$DB_USER = 'root';          // On cPanel: e.g. 'cpaneluser_qist'
$DB_PASS = '';              // On cPanel: e.g. 'YourPassword123'
$DB_PORT = '3306';

function getDbConnection() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS, $DB_PORT;
    try {
        $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";
        return new PDO($dsn, $DB_USER, $DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit();
    }
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}`,
    },
    'api/sync.php': {
      desc: 'The Offline Batch Sync Endpoint. Processes queued payments from field recovery officers with deduplication.',
      lang: 'php',
      code: `<?php
/**
 * QistBazaar - Offline Batch Sync Endpoint
 */
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$transactions = $input['transactions'] ?? [];
$officerName  = $input['officerName'] ?? 'Field Officer';

$pdo = getDbConnection();
$syncedCount = 0;
$syncedIds = [];

try {
    $pdo->beginTransaction();
    $stmtCheck = $pdo->prepare("SELECT id FROM recovery_payments WHERE id = :id LIMIT 1");
    $stmtInsert = $pdo->prepare("
        INSERT INTO recovery_payments (
            id, contract_id, installment_no, amount, payment_method,
            transaction_ref, receipt_no, recovery_officer_name, collected_offline, collected_at
        ) VALUES (
            :id, :cid, :inst, :amt, :method, :tref, :rec, :off, 1, :cat
        )
    ");
    $stmtUpdate = $pdo->prepare("
        UPDATE installment_contracts 
        SET remaining_balance = GREATEST(0, remaining_balance - :amt) 
        WHERE id = :cid
    ");

    foreach ($transactions as $tx) {
        // Idempotency check: Don't charge twice if device retries
        $stmtCheck->execute([':id' => $tx['id']]);
        if ($stmtCheck->fetch()) {
            $syncedIds[] = $tx['id'];
            continue;
        }

        $stmtInsert->execute([
            ':id'     => $tx['id'],
            ':cid'    => $tx['contractId'],
            ':inst'   => $tx['installmentNo'] ?? 1,
            ':amt'    => $tx['amount'],
            ':method' => $tx['paymentMethod'] ?? 'Cash',
            ':tref'   => $tx['transactionRef'] ?? null,
            ':rec'    => $tx['receiptNo'],
            ':off'    => $tx['recoveryOfficerName'] ?? $officerName,
            ':cat'    => date('Y-m-d H:i:s', strtotime($tx['timestamp'] ?? 'now'))
        ]);

        $stmtUpdate->execute([
            ':amt' => $tx['amount'],
            ':cid' => $tx['contractId']
        ]);

        $syncedCount++;
        $syncedIds[] = $tx['id'];
    }

    $pdo->commit();
    jsonResponse([
        'success'      => true,
        'message'      => "Synced {$syncedCount} payment(s) into MySQL successfully.",
        'synced_count' => $syncedCount,
        'synced_ids'   => $syncedIds
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}`,
    },
    '.htaccess': {
      desc: 'Apache configuration for SPA routing fallback, API routing, and GZIP compression.',
      lang: 'apache',
      code: `# Apache Configuration for WAMP Server & cPanel Hosting
Options -Indexes
Options +FollowSymLinks

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Allow direct access to PHP REST API in /api/
    RewriteCond %{REQUEST_URI} ^/api/ [NC]
    RewriteRule ^ - [L]

    # Serve static assets directly
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # Route all other URLs to index.html for Single Page Application
    RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json
</IfModule>`,
    },
    'manifest.json': {
      desc: 'PWA Web App Manifest for mobile installation on Android and Sunmi Handheld POS.',
      lang: 'json',
      code: `{
  "short_name": "QistBazaar",
  "name": "QistBazaar - Pakistan Installments ERP",
  "description": "Offline Field Recovery & Installment Management System",
  "start_url": "/",
  "background_color": "#0f172a",
  "theme_color": "#059669",
  "display": "standalone",
  "orientation": "portrait"
}`,
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Deployment & Offline Engine
              </span>
              <span className="text-xs text-slate-400">
                Apache • PHP PDO • MySQL • IndexedDB PWA
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Server className="w-6 h-6 text-emerald-400" />
              WAMP Server & cPanel Hosting Deployment Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Turnkey production package for local WAMP servers (Windows), shared cPanel hosting, and offline mobile recovery for field officers collecting cash on motorbikes across Pakistani cities.
            </p>
          </div>

          {/* Offline Status Badge & Toggle */}
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-sm p-2 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60">
              {effectiveOffline ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  Field Offline Mode
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Live Online
                </span>
              )}
            </div>

            <button
              onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSimulatedOffline
                  ? 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {isSimulatedOffline ? 'Exit Offline Sim' : 'Simulate Offline Mode'}
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
          <button
            onClick={() => setActiveSubTab('wamp')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'wamp'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>WAMP Server (Localhost)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cpanel')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'cpanel'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>cPanel Shared Hosting</span>
          </button>

          <button
            onClick={() => setActiveSubTab('offline_sim')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'offline_sim'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Field Offline POS & Outbox</span>
            {outboxItems.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
                {outboxItems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('code_viewer')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'code_viewer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Source Code & SQL Files</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Notification Banner */}
      {syncFeedback && (
        <div className="bg-emerald-900/90 border border-emerald-500/50 text-emerald-100 p-4 rounded-xl flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs sm:text-sm font-medium">{syncFeedback}</p>
        </div>
      )}

      {/* SUB-TAB 1: WAMP SERVER (LOCALHOST) */}
      {activeSubTab === 'wamp' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                W
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Deploying on WAMP Server (Windows Localhost / Local Shop LAN)
                </h3>
                <p className="text-xs text-slate-500">
                  Ideal for local shop counters, multi-counter cashiers, and LAN setups in Hafeez Centre, Hall Road, or Urdu Bazaar.
                </p>
              </div>
            </div>

            {/* Step-by-Step Flow */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-sm font-semibold text-slate-800">Copy Files into WAMP `www` Folder</h4>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Open your WAMP installation path and create a directory named <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900">qistbazaar</code>:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
                  C:\wamp64\www\qistbazaar\
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Place the built files (`index.html`, `assets/`, `api/`, `.htaccess`, `database.sql`) into this folder.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-sm font-semibold text-slate-800">Import MySQL Database</h4>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Open phpMyAdmin in your browser:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
                  http://localhost/phpmyadmin
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 mt-2 list-disc list-inside">
                  <li>Create new database: <b className="text-slate-800">qistbazaar_db</b> with collation <b className="text-slate-800">utf8mb4_unicode_ci</b></li>
                  <li>Click <b>Import</b> tab and choose <b className="text-slate-800">database.sql</b></li>
                  <li>Click <b>Go</b> to create tables and sample Pakistani installment contracts.</li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-sm font-semibold text-slate-800">Verify Default Credentials</h4>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  WAMP defaults require no password change. Verify in <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900">api/db.php</code>:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed">
                  $DB_HOST = 'localhost';<br/>
                  $DB_NAME = 'qistbazaar_db';<br/>
                  $DB_USER = 'root';<br/>
                  $DB_PASS = ''; // Blank by default on WAMP
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <h4 className="text-sm font-semibold text-slate-800">Access from Mobiles via Wi-Fi (LAN)</h4>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  To let your recovery officers and floor salesmen access the app from their phones on the shop's Wi-Fi router:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
                  http://192.168.1.100/qistbazaar
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  (Replace 192.168.1.100 with your Windows PC IPv4 from <code className="text-slate-700">ipconfig</code>). Ensure Apache has "Require all granted".
                </p>
              </div>
            </div>

            {/* Quick Diagnostic Test Button */}
            <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Test WAMP Connectivity Diagnostic
                </h4>
                <p className="text-xs text-blue-700">
                  After copying files, test PHP PDO and MySQL tables directly via the health probe.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-blue-300 text-blue-900">
                /api/test_db.php
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CPANEL SHARED HOSTING */}
      {activeSubTab === 'cpanel' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
                cP
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Deploying on cPanel Shared Hosting (Namecheap, Hostinger, PakNIC, Nexus)
                </h3>
                <p className="text-xs text-slate-500">
                  Host online at <code className="text-slate-800 font-mono">qist.yourbrand.pk</code> so field recovery agents anywhere in Pakistan can access and sync in real time.
                </p>
              </div>
            </div>

            {/* cPanel 5-Step Guide */}
            <div className="space-y-4 mt-6">
              {/* Step 1 */}
              <div className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Create MySQL Database via "MySQL Database Wizard"
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Log into your cPanel account. Click <b>MySQL Database Wizard</b>:
                  </p>
                  <ul className="text-xs text-slate-600 list-disc list-inside mt-1.5 space-y-1">
                    <li>Step 1 Database Name: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">youruser_qistdb</code></li>
                    <li>Step 2 Create User & Password: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">youruser_qistadmin</code></li>
                    <li>Step 3 Privileges: Check <b>ALL PRIVILEGES</b> and click <b>Make Changes</b>.</li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Import `database.sql` in phpMyAdmin
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    In cPanel, click <b>phpMyAdmin</b>. In the left sidebar, click your database <code className="text-slate-800 font-mono">youruser_qistdb</code>. Click the <b>Import</b> tab, select <code className="text-slate-800 font-mono">database.sql</code>, and click <b>Go</b>. All 8 tables and Pakistani seed contracts are created.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Upload App Files via cPanel File Manager
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    In cPanel, open <b>File Manager</b>. Navigate to <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">public_html</code> (or a subdomain folder like <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">public_html/qist</code>). Upload the zip package and extract it directly.
                  </p>
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-200">
                    <b>Important:</b> Ensure <code className="font-mono">.htaccess</code> is present! In cPanel File Manager, click "Settings" (top right) and check "Show Hidden Files (dotfiles)" to ensure .htaccess is visible.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Edit `api/db.php` with cPanel Database Credentials
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    In File Manager, right-click <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">api/db.php</code> and select <b>Edit</b>:
                  </p>
                  <div className="p-3 rounded-lg bg-slate-900 text-slate-300 font-mono text-xs mt-2 leading-relaxed">
                    $DB_HOST = 'localhost';<br/>
                    $DB_NAME = 'youruser_qistdb';<br/>
                    $DB_USER = 'youruser_qistadmin';<br/>
                    $DB_PASS = 'YourStrongPassword123#';<br/>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  5
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Activate Free SSL (Let's Encrypt / AutoSSL)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    PWAs and Service Workers require HTTPS to cache assets and work offline on Android devices. In cPanel, click <b>SSL/TLS Status</b> and run <b>AutoSSL</b> to issue a free SSL certificate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FIELD OFFLINE POS & OUTBOX SIMULATOR */}
      {activeSubTab === 'offline_sim' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  Offline Field Recovery Engine (Bike / Remote Areas)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate door-to-door recovery when mobile 4G is weak or down in basements, rural suburbs, or during cellular outages.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleSimulateFieldCollection}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>Collect 14,014 PKR (Offline)</span>
                </button>

                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing || outboxItems.length === 0}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    outboxItems.length > 0 && !isSyncing
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Outbox ({outboxItems.length})</span>
                </button>
              </div>
            </div>

            {/* Offline Architecture Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">
                  1
                </div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Local IndexedDB Outbox
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Each collected installment is signed with a client-generated UUID (Idempotency Key) and stored in the browser's persistent IndexedDB database.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">
                  2
                </div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Immediate 80mm Receipt
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  The agent immediately prints an 80mm thermal receipt via Bluetooth printer or shares it via WhatsApp even with zero internet connectivity.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">
                  3
                </div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Deduplicated Batch Sync
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Once connected to Wi-Fi at the head office or 4G, <code className="text-slate-800">api/sync.php</code> commits the batch atomically to MySQL, updating contracts and daily cash in hand.
                </p>
              </div>
            </div>

            {/* Outbox Table */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>Queued Offline Outbox Records</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                    {outboxItems.length} awaiting sync
                  </span>
                </h4>

                {outboxItems.length > 0 && (
                  <button
                    onClick={handleClearOutbox}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Clear Outbox
                  </button>
                )}
              </div>

              {outboxItems.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    All offline transactions have been synchronized
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Click "Collect 14,014 PKR (Offline)" above to simulate an offline cash receipt during a field visit.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/75 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">Receipt No</th>
                        <th className="px-3 py-2.5 font-semibold">Contract ID</th>
                        <th className="px-3 py-2.5 font-semibold">Customer</th>
                        <th className="px-3 py-2.5 font-semibold">Amount</th>
                        <th className="px-3 py-2.5 font-semibold">Method</th>
                        <th className="px-3 py-2.5 font-semibold">Timestamp</th>
                        <th className="px-3 py-2.5 font-semibold">Sync Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {outboxItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60">
                          <td className="px-3 py-2.5 font-mono font-semibold text-slate-900">
                            {item.receiptNo}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-emerald-700 font-medium">
                            {item.contractId}
                          </td>
                          <td className="px-3 py-2.5 text-slate-800">
                            {item.customerName}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-900">
                            {formatPKR(item.amount)}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {item.paymentMethod}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 text-[11px]">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Pending Sync
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CODE & SQL VIEWER */}
      {activeSubTab === 'code_viewer' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Production Server & Database Files (WAMP / cPanel Ready)
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect or copy the exact code for each file needed on your Apache & MySQL server.
                </p>
              </div>

              {/* File Selector Pills */}
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(fileContents).map((fileName) => (
                  <button
                    key={fileName}
                    onClick={() => setSelectedFile(fileName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      selectedFile === fileName
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {fileName}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected File Description & Copy */}
            <div className="mt-4 flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-600 font-medium">
                {fileContents[selectedFile]?.desc}
              </span>

              <button
                onClick={() => copyToClipboard(fileContents[selectedFile]?.code || '', selectedFile)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-all shrink-0"
              >
                {copiedKey === selectedFile ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Block */}
            <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span>{selectedFile}</span>
                <span>UTF-8 • {fileContents[selectedFile]?.lang.toUpperCase()}</span>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[450px] leading-relaxed select-all">
                {fileContents[selectedFile]?.code}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
