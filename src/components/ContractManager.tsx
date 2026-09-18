import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  Smartphone,
  Phone,
  Calendar,
  Lock,
  Building,
  UserCheck,
  Send,
  Receipt,
  Plus,
} from 'lucide-react';
import { InstallmentContract, InstallmentMonth, PaymentMethod } from '../types';
import { formatPKR, formatCNIC, getWhatsAppLink } from '../utils/formatters';

interface ContractManagerProps {
  contracts: InstallmentContract[];
  onRecordPayment: (
    contractId: string,
    installmentNo: number,
    amount: number,
    method: PaymentMethod,
    ref?: string
  ) => void;
  onViewReceipt: (contract: InstallmentContract, installment: InstallmentMonth) => void;
  openNewContractModal: () => void;
  selectedContract?: InstallmentContract | null;
  onSelectContract: (contract: InstallmentContract | null) => void;
}

export const ContractManager: React.FC<ContractManagerProps> = ({
  contracts,
  onRecordPayment,
  onViewReceipt,
  openNewContractModal,
  selectedContract,
  onSelectContract,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Quick payment modal inside contract manager
  const [payingInstallment, setPayingInstallment] = useState<{
    contract: InstallmentContract;
    installment: InstallmentMonth;
  } | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Cash');
  const [payRef, setPayRef] = useState<string>('');

  const filteredContracts = contracts.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.customerName.toLowerCase().includes(q) ||
      c.customerCnic.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.productName.toLowerCase().includes(q) ||
      c.customerMobile.includes(q);

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'overdue'
        ? c.status === 'defaulter' || c.status === 'legal_action' || c.schedule.some((s) => s.status === 'overdue')
        : c.status === statusFilter;

    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStartPayment = (contract: InstallmentContract, installment: InstallmentMonth) => {
    setPayingInstallment({ contract, installment });
    setPayAmount(installment.amountDue + installment.lateFine);
    setPayMethod('Cash');
    setPayRef('');
  };

  const handleConfirmPayment = () => {
    if (!payingInstallment) return;
    onRecordPayment(
      payingInstallment.contract.id,
      payingInstallment.installment.installmentNo,
      payAmount,
      payMethod,
      payRef
    );
    setPayingInstallment(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Customer, CNIC, Phone, Product, or Contract ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {['all', 'active', 'overdue', 'defaulter', 'legal_action', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={openNewContractModal}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New File</span>
          </button>
        </div>
      </div>

      {/* Contracts Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContracts.map((contract) => {
          const paidMonths = contract.schedule.filter((s) => s.status === 'paid').length;
          const overdueMonths = contract.schedule.filter((s) => s.status === 'overdue').length;
          const progressPercent = Math.round((paidMonths / contract.tenureMonths) * 100);

          return (
            <div
              key={contract.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">
                      {contract.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{contract.customerName}</h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                      <span>CNIC: {contract.customerCnic}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      contract.status === 'legal_action'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : contract.status === 'defaulter'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : overdueMonths > 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {contract.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Product & Financials */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">Product:</span>
                    <span className="font-semibold text-slate-900 text-right truncate max-w-[190px]">
                      {contract.productName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">Monthly Qist:</span>
                    <span className="font-bold text-slate-900">{formatPKR(contract.monthlyInstallment)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">Remaining Balance:</span>
                    <span className="font-bold text-rose-700">{formatPKR(contract.remainingBalance)}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>
                        Paid: {paidMonths} / {contract.tenureMonths} Months
                      </span>
                      <span className="font-semibold">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          overdueMonths > 0 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Badges: Collateral & Zamin */}
                  <div className="flex flex-wrap gap-1 pt-2">
                    {contract.collateral.securityChequeNo && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        ✓ Sec Cheque
                      </span>
                    )}
                    {contract.collateral.stampPaperNo && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        ✓ Stamp Paper
                      </span>
                    )}
                    {contract.collateral.imeiRemoteLocked && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-medium border border-rose-200">
                        📱 Remote Lock
                      </span>
                    )}
                    {contract.guarantors.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        {contract.guarantors.length} Zamin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${contract.customerMobile}`}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4" />
                </a>

                <a
                  href={getWhatsAppLink(
                    contract.customerMobile,
                    `Assalam-o-Alaikum ${contract.customerName} sb. QistBazaar se rabta kiya ja raha hai baraye Contract #${contract.id} (${contract.productName}). Mahana qist: ${formatPKR(
                      contract.monthlyInstallment
                    )}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Open WhatsApp"
                >
                  <Send className="w-4 h-4" />
                </a>

                <button
                  onClick={() => onSelectContract(contract)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Contract Schedule</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contract Detail & Schedule Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Contract #{selectedContract.id}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        selectedContract.status === 'legal_action'
                          ? 'bg-purple-100 text-purple-800'
                          : selectedContract.status === 'defaulter'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedContract.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Client: {selectedContract.customerName} | CNIC: {selectedContract.customerCnic} | Mobile: {selectedContract.customerMobile}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectContract(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Product and Financial Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product Detail */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Item Specifications</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Product:</span>
                    <span className="font-semibold text-slate-800">{selectedContract.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-semibold text-slate-800">{selectedContract.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IMEI/Chassis:</span>
                    <span className="font-mono text-[11px] text-slate-700 break-all">{selectedContract.serialOrImei}</span>
                  </div>
                </div>

                {/* Pricing & Plan */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-600" />
                    <span>Installment Pricing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cash Price:</span>
                    <span>{formatPKR(selectedContract.cashPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Markup (Munafa):</span>
                    <span className="font-semibold text-emerald-700">{selectedContract.markupPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Contract:</span>
                    <span className="font-bold text-slate-900">{formatPKR(selectedContract.totalContractPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Advance (Down):</span>
                    <span>{formatPKR(selectedContract.advancePaid)}</span>
                  </div>
                </div>

                {/* Balances & Officer */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Schedule & Officer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Qist:</span>
                    <span className="font-bold text-slate-900 text-sm">{formatPKR(selectedContract.monthlyInstallment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining:</span>
                    <span className="font-bold text-rose-700">{formatPKR(selectedContract.remainingBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recovery Officer:</span>
                    <span className="font-medium text-slate-800">{selectedContract.recoveryOfficerName}</span>
                  </div>
                </div>
              </div>

              {/* Guarantors & Collateral Safeguards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Zamin (Guarantors) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Verified Zamin (Guarantors)</span>
                  </h4>
                  {selectedContract.guarantors.map((g, idx) => (
                    <div key={g.id || idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>
                          {idx + 1}. {g.fullName} ({g.relationship})
                        </span>
                        <span className="text-emerald-700 text-[10px]">Verified KYC</span>
                      </div>
                      <div className="text-slate-600">CNIC: {g.cnic} | Phone: {g.mobile}</div>
                      <div className="text-slate-500 text-[11px]">Address: {g.address}</div>
                    </div>
                  ))}
                </div>

                {/* Collateral & Security Checklist */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 text-xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>Collateral & Legal Documents</span>
                  </h4>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-700">Undated Bank Cheque (Section 489-F PPC):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedContract.collateral.securityChequeNo || 'Not on file'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-700">Legal Stamp Paper Affidavit:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedContract.collateral.stampPaperNo || 'Rs. 100/1200 Affidavit'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-700">Original Bike Reg File / Book:</span>
                    <span className="font-bold text-emerald-700">
                      {selectedContract.collateral.originalFileHeld ? 'Kept in Office Safe' : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-700">IMEI Remote Lock Profile:</span>
                    <span className="font-bold text-rose-700">
                      {selectedContract.collateral.imeiRemoteLocked ? 'Active (Knox / PayJoy)' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Installment Amortization Table */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                  <span>Monthly Installment Schedule & Payment History</span>
                  <span className="text-xs font-normal text-slate-500">
                    Due Day: {selectedContract.dueDayOfMonth}th of each month
                  </span>
                </h4>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3">Installment Due</th>
                        <th className="py-2.5 px-3">Late Fine</th>
                        <th className="py-2.5 px-3">Paid Amount</th>
                        <th className="py-2.5 px-3">Paid Date & Mode</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedContract.schedule.map((month) => (
                        <tr key={month.installmentNo} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-bold text-slate-800">
                            Month {month.installmentNo}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{month.dueDate}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {formatPKR(month.amountDue)}
                          </td>
                          <td className="py-2.5 px-3 text-amber-700">
                            {month.lateFine > 0 ? `+${formatPKR(month.lateFine)}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-700">
                            {month.amountPaid > 0 ? formatPKR(month.amountPaid) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {month.paidDate ? (
                              <span>
                                {month.paidDate} ({month.paymentMethod})
                              </span>
                            ) : (
                              <span className="text-slate-400">Unpaid</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                month.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : month.status === 'overdue'
                                  ? 'bg-rose-100 text-rose-800'
                                  : month.status === 'due'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {month.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {month.status === 'paid' ? (
                              <button
                                onClick={() => onViewReceipt(selectedContract, month)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartPayment(selectedContract, month)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                              >
                                <span>Receive Payment</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-500 font-mono">
                Contract File ID: {selectedContract.id} | Printed copies archived
              </span>
              <button
                onClick={() => onSelectContract(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Payment Entry Modal */}
      {payingInstallment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Record Installment Payment (قسط وصولی)
              </h3>
              <button
                onClick={() => setPayingInstallment(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <div>
                <strong>Customer:</strong> {payingInstallment.contract.customerName}
              </div>
              <div>
                <strong>Product:</strong> {payingInstallment.contract.productName}
              </div>
              <div>
                <strong>Installment Month:</strong> #{payingInstallment.installment.installmentNo} of{' '}
                {payingInstallment.contract.tenureMonths}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount Received (PKR Rs.)
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-base"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                >
                  <option value="Cash">Cash (Counter / Doorstep)</option>
                  <option value="JazzCash">JazzCash (03XX-XXXXXXX)</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Raast">Raast Instant Payment</option>
                  <option value="Bank Transfer">Bank Transfer (Meezan/HBL/Alfalah)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction Reference / TID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. JC-88192049 or Bank IBFT Ref#"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPayingInstallment(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Confirm & Issue Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
