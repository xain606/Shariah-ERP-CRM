<?php
/**
 * QistBazaar - Offline Batch Sync Endpoint
 * Processes queued offline payments collected by field recovery agents on mobile
 */
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'error' => 'Method not allowed. Use POST.'], 405);
}

$input = getJsonInput();
$transactions = isset($input['transactions']) && is_array($input['transactions']) ? $input['transactions'] : [];
$officerName  = isset($input['officerName']) ? trim($input['officerName']) : 'Field Officer';
$batchId      = 'BATCH-' . date('YmdHis') . '-' . bin2hex(random_bytes(3));

if (empty($transactions)) {
    jsonResponse([
        'success'  => true,
        'message'  => 'No pending offline transactions to sync.',
        'synced'   => 0,
        'batch_id' => $batchId
    ]);
}

$pdo = getDbConnection();

$syncedCount = 0;
$skippedDuplicates = 0;
$totalAmountSynced = 0.00;
$syncedIds = [];
$errors = [];

try {
    $pdo->beginTransaction();

    // Prepared statements for high performance and atomicity
    $stmtCheckTx = $pdo->prepare("SELECT id FROM recovery_payments WHERE id = :id LIMIT 1");
    
    $stmtInsertPayment = $pdo->prepare("
        INSERT INTO recovery_payments (
            id, contract_id, installment_no, amount, payment_method,
            transaction_ref, receipt_no, recovery_officer_name,
            collected_offline, collected_at, synced_at, gps_lat, gps_lng
        ) VALUES (
            :id, :contract_id, :installment_no, :amount, :payment_method,
            :transaction_ref, :receipt_no, :recovery_officer_name,
            1, :collected_at, CURRENT_TIMESTAMP, :gps_lat, :gps_lng
        )
    ");

    $stmtUpdateSchedule = $pdo->prepare("
        UPDATE installment_schedules 
        SET amount_paid = amount_paid + :amount,
            paid_date = :paid_date,
            payment_method = :payment_method,
            transaction_ref = :transaction_ref,
            receipt_no = :receipt_no,
            collected_by = :collected_by,
            status = 'paid'
        WHERE contract_id = :contract_id AND installment_no = :installment_no
    ");

    $stmtUpdateContract = $pdo->prepare("
        UPDATE installment_contracts
        SET remaining_balance = GREATEST(0, remaining_balance - :amount)
        WHERE id = :contract_id
    ");

    $stmtUpdateOfficer = $pdo->prepare("
        UPDATE recovery_officers
        SET cash_in_hand_today = cash_in_hand_today + :amount,
            collected_this_month = collected_this_month + :amount
        WHERE name = :officer_name
    ");

    foreach ($transactions as $tx) {
        $txId = $tx['id'] ?? null;
        $contractId = $tx['contractId'] ?? null;
        $amount = floatval($tx['amount'] ?? 0);
        $installmentNo = intval($tx['installmentNo'] ?? 1);
        $paymentMethod = $tx['paymentMethod'] ?? 'Cash';
        $transactionRef = $tx['transactionRef'] ?? null;
        $receiptNo = $tx['receiptNo'] ?? ('REC-' . time());
        $txOfficer = !empty($tx['recoveryOfficerName']) ? $tx['recoveryOfficerName'] : $officerName;
        $collectedAt = !empty($tx['timestamp']) ? date('Y-m-d H:i:s', strtotime($tx['timestamp'])) : date('Y-m-d H:i:s');
        $gpsLat = isset($tx['gpsLocation']['lat']) ? $tx['gpsLocation']['lat'] : null;
        $gpsLng = isset($tx['gpsLocation']['lng']) ? $tx['gpsLocation']['lng'] : null;

        if (!$txId || !$contractId || $amount <= 0) {
            $errors[] = "Invalid record skipped (contract: {$contractId}, amount: {$amount})";
            continue;
        }

        // Idempotency check: Has this UUID already been recorded in MySQL?
        $stmtCheckTx->execute([':id' => $txId]);
        if ($stmtCheckTx->fetch()) {
            $skippedDuplicates++;
            $syncedIds[] = $txId;
            continue; // Already processed, skip safely without double-charging
        }

        // 1. Insert into recovery payments ledger
        $stmtInsertPayment->execute([
            ':id'                    => $txId,
            ':contract_id'           => $contractId,
            ':installment_no'        => $installmentNo,
            ':amount'                => $amount,
            ':payment_method'        => $paymentMethod,
            ':transaction_ref'       => $transactionRef,
            ':receipt_no'            => $receiptNo,
            ':recovery_officer_name' => $txOfficer,
            ':collected_at'          => $collectedAt,
            ':gps_lat'               => $gpsLat,
            ':gps_lng'               => $gpsLng
        ]);

        // 2. Update installment schedule
        $stmtUpdateSchedule->execute([
            ':amount'          => $amount,
            ':paid_date'       => date('Y-m-d', strtotime($collectedAt)),
            ':payment_method'  => $paymentMethod,
            ':transaction_ref' => $transactionRef,
            ':receipt_no'      => $receiptNo,
            ':collected_by'    => $txOfficer,
            ':contract_id'     => $contractId,
            ':installment_no'  => $installmentNo
        ]);

        // 3. Decrement remaining balance in contract
        $stmtUpdateContract->execute([
            ':amount'      => $amount,
            ':contract_id' => $contractId
        ]);

        // 4. Update Officer cash in hand
        $stmtUpdateOfficer->execute([
            ':amount'       => $amount,
            ':officer_name' => $txOfficer
        ]);

        $syncedCount++;
        $totalAmountSynced += $amount;
        $syncedIds[] = $txId;
    }

    // 5. Log this sync batch into offline_sync_log
    $stmtLog = $pdo->prepare("
        INSERT INTO offline_sync_log (
            batch_id, officer_name, total_records, total_amount, client_ip, status
        ) VALUES (
            :batch_id, :officer_name, :total_records, :total_amount, :client_ip, 'SUCCESS'
        )
    ");
    $stmtLog->execute([
        ':batch_id'      => $batchId,
        ':officer_name'  => $officerName,
        ':total_records' => $syncedCount,
        ':total_amount'  => $totalAmountSynced,
        ':client_ip'     => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
    ]);

    $pdo->commit();

    jsonResponse([
        'success'           => true,
        'message'           => "Batch sync completed. {$syncedCount} payment(s) committed to MySQL.",
        'batch_id'          => $batchId,
        'synced_count'      => $syncedCount,
        'duplicates_ignored'=> $skippedDuplicates,
        'total_amount_pkr'  => $totalAmountSynced,
        'synced_ids'        => $syncedIds,
        'errors'            => $errors
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonResponse([
        'success' => false,
        'error'   => 'Batch sync failed: ' . $e->getMessage()
    ], 500);
}
