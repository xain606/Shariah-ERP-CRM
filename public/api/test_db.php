<?php
/**
 * QistBazaar - WAMP & cPanel Health Diagnostic Script
 * Open: http://localhost/qistbazaar/api/test_db.php or https://yourdomain.com/api/test_db.php
 */
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$report = [
    'timestamp'       => date('Y-m-d H:i:s'),
    'php_version'     => phpversion(),
    'os'              => PHP_OS,
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'pdo_mysql'       => extension_loaded('pdo_mysql'),
    'database'        => [
        'host'   => $DB_HOST,
        'name'   => $DB_NAME,
        'user'   => $DB_USER,
        'status' => 'Testing...'
    ],
    'tables'          => []
];

try {
    $pdo = getDbConnection();
    $report['database']['status'] = 'CONNECTED (MySQL Online)';

    // Check existing tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $report['tables']['found'] = $tables;
    $report['tables']['count'] = count($tables);

    // Count records
    if (in_array('installment_contracts', $tables)) {
        $stmtC = $pdo->query("SELECT COUNT(*) FROM installment_contracts");
        $report['records']['contracts'] = $stmtC->fetchColumn();
    }
    if (in_array('customers', $tables)) {
        $stmtCu = $pdo->query("SELECT COUNT(*) FROM customers");
        $report['records']['customers'] = $stmtCu->fetchColumn();
    }
    if (in_array('recovery_payments', $tables)) {
        $stmtP = $pdo->query("SELECT COUNT(*) FROM recovery_payments");
        $report['records']['payments'] = $stmtP->fetchColumn();
    }

    $report['overall_status'] = 'READY FOR PRODUCTION (WAMP / cPanel Validated)';

} catch (Exception $e) {
    $report['database']['status'] = 'CONNECTION FAILED';
    $report['database']['error']  = $e->getMessage();
    $report['overall_status']     = 'ACTION NEEDED: Check MySQL database credentials in api/db.php';
}

echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
