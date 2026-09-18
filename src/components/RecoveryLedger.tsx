import React, { useState } from 'react';
import {
  Clock,
  Printer,
  Share2,
  CheckCircle,
  Plus,
  Wallet,
  Building,
  UserCheck,
  Send,
  Calendar,
} from 'lucide-react';
import { InstallmentContract, InstallmentMonth, PaymentMethod, RecoveryOfficer } from '../types';
import { formatPKR, getWhatsAppLink } from '../utils/formatters';

interface RecoveryLedgerProps {
  contracts: InstallmentContract[];
  recoveryOfficers: RecoveryOfficer[];
  onRecordPayment: (
    contractId: string,
    installmentNo: number,
    amount: number,
    method: PaymentMethod,
    ref?: string,
    officerName?: string
  ) => void;
  onViewReceipt: (contract: InstallmentContract, installment: InstallmentMonth) => void;
}

export const RecoveryLedger: React.FC<RecoveryLedgerProps> = ({
  contracts,
  recoveryOfficers,
  onRecordPayment,
  onViewReceipt,
}) => {
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Quick collection drawer / form
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [selectedContractId, setSelectedContractId] = useState<string>(contracts[0]?.id || '');
  const [recAmount, setRecAmount] = useState<number>(14014);
  const [recMethod, setRecMethod] = useState<PaymentMethod>('Cash');
  const [recRef, setRecRef] = useState<string>('');
  const [recOfficer, setRecOfficer] = useState<string>(recoveryOfficers[0]?.name || '');

  // Extract all paid transactions across all contracts
  const paidTransactions: {
    contract: InstallmentContract;
    installment: InstallmentMonth;
  }[] = [];

  contracts.forEach((c) => {
    c.schedule.forEach((s) => {
      if (s.status === 'paid' && s.paidDate) {
        paidTransactions.push({ contract: c, installment: s });
      }
    });
  });

  // Sort by date descending
  paidTransactions.sort((a, b) => (b.installment.paidDate || '').localeCompare(a.installment.paidDate || ''));

  // Pending / Overdue installments ready for collection
  const pendingInstallments: {
    contract: InstallmentContract;
    installment: InstallmentMonth;
  }[] = [];

  contracts.forEach((c) => {
    c.schedule.forEach((s) => {
      if (s.status === 'due' || s.status === 'overdue') {
        pendingInstallments.push({ contract: c, installment: s });
      }
    });
  });

  const handleContractSelect = (cId: string) => {
    setSelectedContractId(cId);
    const c = contracts.find((x) => x.id === cId);
    if (c) {
      const nextUnpaid = c.schedule.find((s) => s.status === 'due' || s.status === 'overdue') || c.schedule[0];
      setRecAmount(nextUnpaid.amountDue + nextUnpaid.lateFine);
    }
  };

  const handleSubmitCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const c = contracts.find((x) => x.id === selectedContractId);
    if (!c) return;

    const nextUnpaid = c.schedule.find((s) => s.status === 'due' || s.status === 'overdue') || c.schedule[0];
    onRecordPayment(c.id, nextUnpaid.installmentNo, recAmount, recMethod, recRef, recOfficer);
    setIsRecording(false);
  };

  const totalCollectedToday = paidTransactions.reduce((sum, t) => sum + t.installment.amountPaid, 0);

  return (
    <div className="space-y-6">
      {/* Header & Roznamcha Overview */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Daily Recovery Book (روزنامچہ وصولی)
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Field Cash Reconciliation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cash, JazzCash, EasyPaisa & Raast recoveries recorded by field recovery agents and shop counters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRecording(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Cash / Online Recovery</span>
          </button>
        </div>
      </div>

      {/* Field Officers Cash-in-Hand Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recoveryOfficers.map((off) => (
          <div
            key={off.id}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{off.name}</h3>
                  <div className="text-xs text-slate-500">{off.assignedZone}</div>
                </div>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <UserCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-600 font-medium">Cash in Hand Today:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {formatPKR(off.cashInHandToday)}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
              <span>Monthly: {formatPKR(off.collectedThisMonth)}</span>
              <span>Target: {formatPKR(off.targetMonthly)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Collection Drawer / Modal */}
      {isRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Receive Installment (قسط جمع فرمائیں)</span>
              </h3>
              <button
                onClick={() => setIsRecording(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitCollection} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Active Contract / Customer
                </label>
                <select
                  value={selectedContractId}
                  onChange={(e) => handleContractSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                >
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.customerName} ({c.productName}) [Bal: {formatPKR(c.remainingBalance)}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Amount Received (PKR Rs.)
                  </label>
                  <input
                    type="number"
                    value={recAmount}
                    onChange={(e) => setRecAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                  <select
                    value={recMethod}
                    onChange={(e) => setRecMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    <option value="Cash">Cash (Doorstep / Shop Counter)</option>
                    <option value="JazzCash">JazzCash (03XX-XXXXXXX)</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Raast">Raast Instant Payment</option>
                    <option value="Bank Transfer">Bank Transfer (IBFT)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Collecting Recovery Officer
                  </label>
                  <select
                    value={recOfficer}
                    onChange={(e) => setRecOfficer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    {recoveryOfficers.map((o) => (
                      <option key={o.id} value={o.name}>
                        {o.name}
                      </option>
                    ))}
                    <option value="Direct Shop Counter">Direct Shop Counter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Transaction ID / Reference # (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JC-881920 or EP-99201"
                    value={recRef}
                    onChange={(e) => setRecRef(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecording(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Post Payment & Print Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Recoveries & Receipts Ledger ({paidTransactions.length} Collections)
            </h3>
            <p className="text-xs text-slate-500">
              Instant 80mm thermal slip reprint, WhatsApp notification, and transaction reference logs.
            </p>
          </div>

          <div className="flex gap-2 text-xs">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
            >
              <option value="all">All Payment Modes</option>
              <option value="Cash">Cash</option>
              <option value="JazzCash">JazzCash</option>
              <option value="EasyPaisa">EasyPaisa</option>
              <option value="Raast">Raast</option>
              <option value="Bank Transfer">Bank IBFT</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer & Phone</th>
                <th className="py-3 px-4">Product / Item</th>
                <th className="py-3 px-4">Qist #</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Mode / Ref</th>
                <th className="py-3 px-4">Officer</th>
                <th className="py-3 px-4 text-right">Receipt & Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paidTransactions
                .filter(
                  (t) => methodFilter === 'all' || t.installment.paymentMethod === methodFilter
                )
                .map(({ contract, installment }) => {
                  const receiptMsg = `Assalam-o-Alaikum ${contract.customerName} sb. QistBazaar se aap ki mahana qist #${installment.installmentNo} mablagh ${formatPKR(
                    installment.amountPaid
                  )} ba-zariya ${installment.paymentMethod || 'Cash'} ba-khairiyat wasool ho chuki hai. Receipt No: ${
                    installment.receiptNo || 'REC-2026'
                  }. Shukriya!`;

                  return (
                    <tr key={`${contract.id}-${installment.installmentNo}`} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {installment.receiptNo || `REC-2026-${installment.installmentNo * 123}`}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{installment.paidDate}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{contract.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{contract.customerMobile}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium truncate max-w-[160px]">
                        {contract.productName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">
                        Month {installment.installmentNo}/{contract.tenureMonths}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-700 text-sm">
                        {formatPKR(installment.amountPaid)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{installment.paymentMethod}</span>
                        {installment.transactionRef && (
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[100px]">
                            {installment.transactionRef}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{installment.collectedBy || contract.recoveryOfficerName}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={getWhatsAppLink(contract.customerMobile, receiptMsg)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => onViewReceipt(contract, installment)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                          >
                            <Printer className="w-3 h-3" />
                            <span>80mm Slip</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
