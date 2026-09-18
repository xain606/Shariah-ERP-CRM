<?php
/**
 * QistBazaar - Contracts REST API
 * Handles listing contracts, filtering by status/officer, and creating new installment contracts
 */
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

if ($method === 'GET') {
    // Optional query filters
    $status = isset($_GET['status']) ? trim($_GET['status']) : null;
    $search = isset($_GET['q']) ? trim($_GET['q']) : null;
    $contractId = isset($_GET['id']) ? trim($_GET['id']) : null;

    if ($contractId) {
        // Fetch single contract with schedule and guarantors
        $stmt = $pdo->prepare("SELECT * FROM installment_contracts WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $contractId]);
        $contract = $stmt->fetch();

        if (!$contract) {
            jsonResponse(['success' => false, 'error' => 'Contract not found'], 404);
        }

        // Fetch schedule
        $stmtSched = $pdo->prepare("SELECT * FROM installment_schedules WHERE contract_id = :id ORDER BY installment_no ASC");
        $stmtSched->execute([':id' => $contractId]);
        $contract['schedule'] = $stmtSched->fetchAll();

        // Fetch guarantors
        $stmtGua = $pdo->prepare("SELECT * FROM guarantors WHERE customer_id = :cust_id");
        $stmtGua->execute([':cust_id' => $contract['customer_id']]);
        $contract['guarantors'] = $stmtGua->fetchAll();

        jsonResponse(['success' => true, 'data' => $contract]);
    }

    // List all contracts
    $sql = "SELECT c.*, 
            (SELECT COUNT(*) FROM installment_schedules WHERE contract_id = c.id AND status = 'paid') as paid_installments,
            (SELECT COUNT(*) FROM installment_schedules WHERE contract_id = c.id AND status = 'overdue') as overdue_installments
            FROM installment_contracts c WHERE 1=1";
    $params = [];

    if ($status) {
        $sql .= " AND c.status = :status";
        $params[':status'] = $status;
    }
    if ($search) {
        $sql .= " AND (c.id LIKE :s OR c.customer_name LIKE :s OR c.customer_cnic LIKE :s OR c.serial_or_imei LIKE :s)";
        $params[':s'] = "%{$search}%";
    }

    $sql .= " ORDER BY c.created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $contracts = $stmt->fetchAll();

    // Attach schedules to each contract for the frontend
    foreach ($contracts as &$c) {
        $stmtS = $pdo->prepare("SELECT * FROM installment_schedules WHERE contract_id = :cid ORDER BY installment_no ASC");
        $stmtS->execute([':cid' => $c['id']]);
        $c['schedule'] = $stmtS->fetchAll();
    }

    jsonResponse(['success' => true, 'count' => count($contracts), 'data' => $contracts]);

} elseif ($method === 'POST') {
    // Create new installment contract
    $data = getJsonInput();

    if (empty($data['customerId']) || empty($data['productId']) || empty($data['totalContractPrice'])) {
        jsonResponse(['success' => false, 'error' => 'Missing required fields: customerId, productId, totalContractPrice'], 400);
    }

    $contractId = 'PK-QIST-' . date('Y') . '-' . sprintf('%04d', rand(100, 9999));

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("
            INSERT INTO installment_contracts (
                id, customer_id, customer_name, customer_cnic, customer_mobile, customer_city,
                product_id, product_name, category, serial_or_imei, cash_price, markup_percentage,
                total_contract_price, advance_paid, file_charges, remaining_balance, tenure_months,
                monthly_installment, start_date, due_day_of_month, status, recovery_officer_id,
                recovery_officer_name, security_cheque_no, bank_name, stamp_paper_no,
                original_file_held, imei_remote_locked, notes
            ) VALUES (
                :id, :customer_id, :customer_name, :customer_cnic, :customer_mobile, :customer_city,
                :product_id, :product_name, :category, :serial_or_imei, :cash_price, :markup_percentage,
                :total_contract_price, :advance_paid, :file_charges, :remaining_balance, :tenure_months,
                :monthly_installment, :start_date, :due_day_of_month, 'active', :recovery_officer_id,
                :recovery_officer_name, :security_cheque_no, :bank_name, :stamp_paper_no,
                :original_file_held, :imei_remote_locked, :notes
            )
        ");

        $stmt->execute([
            ':id'                   => $contractId,
            ':customer_id'          => $data['customerId'],
            ':customer_name'        => $data['customerName'],
            ':customer_cnic'        => $data['customerCnic'],
            ':customer_mobile'      => $data['customerMobile'],
            ':customer_city'        => $data['customerCity'] ?? 'Lahore',
            ':product_id'           => $data['productId'],
            ':product_name'         => $data['productName'],
            ':category'             => $data['category'],
            ':serial_or_imei'       => $data['serialOrImei'],
            ':cash_price'           => $data['cashPrice'],
            ':markup_percentage'    => $data['markupPercentage'],
            ':total_contract_price' => $data['totalContractPrice'],
            ':advance_paid'         => $data['advancePaid'],
            ':file_charges'         => $data['fileCharges'] ?? 2000,
            ':remaining_balance'    => $data['remainingBalance'],
            ':tenure_months'        => $data['tenureMonths'],
            ':monthly_installment'  => $data['monthlyInstallment'],
            ':start_date'           => $data['startDate'] ?? date('Y-m-d'),
            ':due_day_of_month'     => $data['dueDayOfMonth'] ?? 10,
            ':recovery_officer_id'  => $data['recoveryOfficerId'] ?? 'OFF-001',
            ':recovery_officer_name'=> $data['recoveryOfficerName'] ?? 'Muhammad Rizwan',
            ':security_cheque_no'   => $data['collateral']['securityChequeNo'] ?? null,
            ':bank_name'            => $data['collateral']['bankName'] ?? null,
            ':stamp_paper_no'       => $data['collateral']['stampPaperNo'] ?? null,
            ':original_file_held'   => !empty($data['collateral']['originalFileHeld']) ? 1 : 0,
            ':imei_remote_locked'   => !empty($data['collateral']['imeiRemoteLocked']) ? 1 : 0,
            ':notes'                => $data['notes'] ?? null
        ]);

        // Generate Installment Schedule Rows
        if (!empty($data['schedule']) && is_array($data['schedule'])) {
            $stmtSched = $pdo->prepare("
                INSERT INTO installment_schedules (
                    contract_id, installment_no, due_date, amount_due, status
                ) VALUES (
                    :contract_id, :installment_no, :due_date, :amount_due, :status
                )
            ");
            foreach ($data['schedule'] as $m) {
                $stmtSched->execute([
                    ':contract_id'    => $contractId,
                    ':installment_no' => $m['installmentNo'],
                    ':due_date'       => $m['dueDate'],
                    ':amount_due'     => $m['amountDue'],
                    ':status'         => $m['status'] ?? 'pending'
                ]);
            }
        }

        // Mark product as Contract Assigned in inventory
        $stmtProd = $pdo->prepare("UPDATE inventory_items SET status = 'Contract Assigned', contract_id = :cid WHERE id = :pid");
        $stmtProd->execute([':cid' => $contractId, ':pid' => $data['productId']]);

        $pdo->commit();

        jsonResponse([
            'success'     => true,
            'message'     => 'Installment contract successfully booked in MySQL',
            'contract_id' => $contractId
        ], 201);

    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['success' => false, 'error' => 'Failed to create contract: ' . $e->getMessage()], 500);
    }
} else {
    jsonResponse(['success' => false, 'error' => 'Method not supported'], 405);
}
