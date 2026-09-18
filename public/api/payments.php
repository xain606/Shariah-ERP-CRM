<?php
/**
 * QistBazaar - Payments & Recovery Roznamcha API
 * Records single payments, generates receipt data, and returns daily collections
 */
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

if ($method === 'GET') {
    // Return today's recovery entries or filter by date
    $date = isset($_GET['date']) ? trim($_GET['date']) : date('Y-m-d');
    $officer = isset($_GET['officer']) ? trim($_GET['officer']) : null;

    $sql = "SELECT p.*, c.customer_name, c.product_name, c.customer_mobile
            FROM recovery_payments p
            JOIN installment_contracts c ON p.contract_id = c.id
            WHERE DATE(p.collected_at) = :dt";
    $params = [':dt' => $date];

    if ($officer) {
        $sql .= " AND p.recovery_officer_name = :officer";
        $params[':officer'] = $officer;
    }

    $sql .= " ORDER BY p.collected_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $payments = $stmt->fetchAll();

    // Summary calculation
    $totalAmount = 0;
    foreach ($payments as $p) {
        $totalAmount += floatval($p['amount']);
    }

    jsonResponse([
        'success'      => true,
        'date'         => $date,
        'total_amount' => $totalAmount,
        'count'        => count($payments),
        'payments'     => $payments
    ]);

} elseif ($method === 'POST') {
    $data = getJsonInput();

    if (empty($data['contractId']) || empty($data['amount'])) {
        jsonResponse(['success' => false, 'error' => 'Missing contractId or amount'], 400);
    }

    $paymentId = $data['id'] ?? ('PAY-' . date('YmdHis') . '-' . bin2hex(random_bytes(2)));
    $contractId = $data['contractId'];
    $installmentNo = intval($data['installmentNo'] ?? 1);
    $amount = floatval($data['amount']);
    $paymentMethod = $data['paymentMethod'] ?? 'Cash';
    $transactionRef = $data['transactionRef'] ?? null;
    $receiptNo = $data['receiptNo'] ?? ('REC-' . date('Y') . '-' . rand(1000, 9999));
    $officerName = $data['recoveryOfficerName'] ?? 'Counter Cashier';

    try {
        $pdo->beginTransaction();

        // 1. Insert payment record
        $stmtPay = $pdo->prepare("
            INSERT INTO recovery_payments (
                id, contract_id, installment_no, amount, payment_method,
                transaction_ref, receipt_no, recovery_officer_name,
                collected_offline, collected_at
            ) VALUES (
                :id, :contract_id, :installment_no, :amount, :payment_method,
                :transaction_ref, :receipt_no, :recovery_officer_name,
                0, CURRENT_TIMESTAMP
            )
        ");
        $stmtPay->execute([
            ':id'                    => $paymentId,
            ':contract_id'           => $contractId,
            ':installment_no'        => $installmentNo,
            ':amount'                => $amount,
            ':payment_method'        => $paymentMethod,
            ':transaction_ref'       => $transactionRef,
            ':receipt_no'            => $receiptNo,
            ':recovery_officer_name' => $officerName
        ]);

        // 2. Update installment schedule
        $stmtSched = $pdo->prepare("
            UPDATE installment_schedules
            SET amount_paid = amount_paid + :amount,
                paid_date = CURRENT_DATE,
                payment_method = :payment_method,
                transaction_ref = :transaction_ref,
                receipt_no = :receipt_no,
                collected_by = :collected_by,
                status = 'paid'
            WHERE contract_id = :contract_id AND installment_no = :installment_no
        ");
        $stmtSched->execute([
            ':amount'          => $amount,
            ':payment_method'  => $paymentMethod,
            ':transaction_ref' => $transactionRef,
            ':receipt_no'      => $receiptNo,
            ':collected_by'    => $officerName,
            ':contract_id'     => $contractId,
            ':installment_no'  => $installmentNo
        ]);

        // 3. Decrement remaining contract balance
        $stmtCont = $pdo->prepare("
            UPDATE installment_contracts
            SET remaining_balance = GREATEST(0, remaining_balance - :amount)
            WHERE id = :contract_id
        ");
        $stmtCont->execute([
            ':amount'      => $amount,
            ':contract_id' => $contractId
        ]);

        // 4. Update Officer cash in hand
        $stmtOff = $pdo->prepare("
            UPDATE recovery_officers
            SET cash_in_hand_today = cash_in_hand_today + :amount,
                collected_this_month = collected_this_month + :amount
            WHERE name = :officer_name
        ");
        $stmtOff->execute([
            ':amount'       => $amount,
            ':officer_name' => $officerName
        ]);

        // 5. Fetch updated balance
        $stmtBal = $pdo->prepare("SELECT remaining_balance, customer_name, customer_mobile FROM installment_contracts WHERE id = :id");
        $stmtBal->execute([':id' => $contractId]);
        $updatedContract = $stmtBal->fetch();

        $pdo->commit();

        jsonResponse([
            'success'           => true,
            'message'           => 'Installment payment recorded successfully',
            'receipt_no'        => $receiptNo,
            'payment_id'        => $paymentId,
            'remaining_balance' => floatval($updatedContract['remaining_balance']),
            'customer_name'     => $updatedContract['customer_name']
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['success' => false, 'error' => 'Payment failed: ' . $e->getMessage()], 500);
    }
}
