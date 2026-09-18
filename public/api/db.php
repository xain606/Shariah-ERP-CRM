<?php
/**
 * QistBazaar - Database Connection Helper for WAMP Server & cPanel Hosting
 * Compatible with PHP 7.4, 8.0, 8.1, 8.2, 8.3
 */

// Allow CORS for development & cross-device PWA mobile apps
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -----------------------------------------------------------------------------
// Database Configuration (Default WAMP Server & cPanel friendly)
// -----------------------------------------------------------------------------
// For WAMP Localhost:
// - Host: localhost
// - User: root
// - Pass: (leave empty "")
// - Database: qistbazaar_db
//
// For cPanel Hosting:
// - Host: localhost
// - User: cpusername_qistuser
// - Pass: YourStrongPassword123#
// - Database: cpusername_qistdb
// -----------------------------------------------------------------------------

$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_NAME = getenv('DB_NAME') ?: 'qistbazaar_db';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$DB_PORT = getenv('DB_PORT') ?: '3306';

function getDbConnection() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS, $DB_PORT;
    
    try {
        $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        
        return new PDO($dsn, $DB_USER, $DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => 'Database connection failed: ' . $e->getMessage(),
            'tip'     => 'Check your database credentials in api/db.php or ensure MySQL service is running in WAMP / cPanel.'
        ]);
        exit();
    }
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
