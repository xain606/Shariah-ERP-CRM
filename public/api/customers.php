<?php
/**
 * QistBazaar - Customers & Guarantors REST API
 */
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

if ($method === 'GET') {
    $search = isset($_GET['q']) ? trim($_GET['q']) : null;
    $sql = "SELECT * FROM customers WHERE 1=1";
    $params = [];

    if ($search) {
        $sql .= " AND (full_name LIKE :s OR cnic LIKE :s OR mobile LIKE :s)";
        $params[':s'] = "%{$search}%";
    }

    $sql .= " ORDER BY created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $customers = $stmt->fetchAll();

    foreach ($customers as &$c) {
        $stmtG = $pdo->prepare("SELECT * FROM guarantors WHERE customer_id = :cid");
        $stmtG->execute([':cid' => $c['id']]);
        $c['guarantors'] = $stmtG->fetchAll();
    }

    jsonResponse(['success' => true, 'count' => count($customers), 'data' => $customers]);

} elseif ($method === 'POST') {
    $data = getJsonInput();

    if (empty($data['fullName']) || empty($data['cnic']) || empty($data['mobile'])) {
        jsonResponse(['success' => false, 'error' => 'Missing full_name, cnic, or mobile'], 400);
    }

    $customerId = $data['id'] ?? ('CUST-' . rand(100, 999));

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("
            INSERT INTO customers (
                id, full_name, father_name, cnic, mobile, alternate_mobile,
                address, city, residential_type, electricity_ref_no, occupation,
                monthly_income, verisys_status, risk_score
            ) VALUES (
                :id, :full_name, :father_name, :cnic, :mobile, :alternate_mobile,
                :address, :city, :residential_type, :electricity_ref_no, :occupation,
                :monthly_income, :verisys_status, :risk_score
            )
        ");

        $stmt->execute([
            ':id'                 => $customerId,
            ':full_name'          => $data['fullName'],
            ':father_name'        => $data['fatherName'] ?? '',
            ':cnic'               => $data['cnic'],
            ':mobile'             => $data['mobile'],
            ':alternate_mobile'   => $data['alternateMobile'] ?? null,
            ':address'            => $data['address'] ?? '',
            ':city'               => $data['city'] ?? 'Lahore',
            ':residential_type'   => $data['residentialType'] ?? 'owned',
            ':electricity_ref_no' => $data['electricityRefNo'] ?? null,
            ':occupation'         => $data['occupation'] ?? '',
            ':monthly_income'     => $data['monthlyIncome'] ?? 0,
            ':verisys_status'     => $data['verisysStatus'] ?? 'verified',
            ':risk_score'         => $data['riskScore'] ?? 'Low Risk'
        ]);

        if (!empty($data['guarantors']) && is_array($data['guarantors'])) {
            $stmtG = $pdo->prepare("
                INSERT INTO guarantors (
                    id, customer_id, full_name, father_name, cnic, mobile,
                    relationship, address, workplace, verisys_status
                ) VALUES (
                    :id, :customer_id, :full_name, :father_name, :cnic, :mobile,
                    :relationship, :address, :workplace, :verisys_status
                )
            ");

            foreach ($data['guarantors'] as $idx => $g) {
                $gId = 'GUA-' . $customerId . '-' . ($idx + 1);
                $stmtG->execute([
                    ':id'             => $gId,
                    ':customer_id'    => $customerId,
                    ':full_name'      => $g['fullName'] ?? '',
                    ':father_name'    => $g['fatherName'] ?? '',
                    ':cnic'           => $g['cnic'] ?? '',
                    ':mobile'         => $g['mobile'] ?? '',
                    ':relationship'   => $g['relationship'] ?? '',
                    ':address'        => $g['address'] ?? '',
                    ':workplace'      => $g['workplace'] ?? null,
                    ':verisys_status' => $g['verisysStatus'] ?? 'verified'
                ]);
            }
        }

        $pdo->commit();

        jsonResponse([
            'success'     => true,
            'message'     => 'Customer and dual guarantors saved to MySQL',
            'customer_id' => $customerId
        ], 201);

    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['success' => false, 'error' => 'Failed to save customer: ' . $e->getMessage()], 500);
    }
}
