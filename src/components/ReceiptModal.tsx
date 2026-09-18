import React from 'react';
import { X, Printer, Share2, CheckCircle2 } from 'lucide-react';
import { formatPKR, URDU_TERMS, getWhatsAppLink } from '../utils/formatters';
import { InstallmentContract, InstallmentMonth } from '../types';

interface ReceiptModalProps {
  contract: InstallmentContract;
  installment: InstallmentMonth;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  contract,
  installment,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptDate = installment.paidDate || new Date().toISOString().split('T')[0];
  const receiptNo = installment.receiptNo || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Calculate remaining after this installment
  const paidSoFar = contract.schedule
    .filter((s) => s.status === 'paid' && s.installmentNo <= installment.installmentNo)
    .reduce((sum, s) => sum + s.amountPaid, 0);
  const remaining = Math.max(0, contract.totalContractPrice - contract.advancePaid - paidSoFar);

  const whatsappMessage = `*QISTBAZAAR RECEIPT SLIP* 🧾
Receipt No: ${receiptNo}
Customer: ${contract.customerName} (CNIC: ${contract.customerCnic})
Product: ${contract.productName}
Installment: ${installment.installmentNo} of ${contract.tenureMonths}
Amount Paid: ${formatPKR(installment.amountPaid)}
Payment Mode: ${installment.paymentMethod || 'Cash'}
Remaining Balance: ${formatPKR(remaining)}
Date: ${receiptDate}
Shukriya! JazakAllah Khair.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Installment Receipt (80mm Thermal Slip)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Slip Container */}
        <div className="p-6 bg-slate-100 max-h-[75vh] overflow-y-auto flex justify-center">
          <div
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white p-5 rounded-lg shadow-sm border border-slate-200 text-slate-900 font-mono text-xs leading-relaxed"
          >
            {/* Urdu Bismillah */}
            <div className="text-center font-urdu text-sm mb-1 text-slate-800">
              {URDU_TERMS.bismillah}
            </div>

            {/* Shop Brand Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
              <h2 className="text-base font-bold tracking-tight text-slate-900 uppercase">
                QIST BAZAAR PAKISTAN
              </h2>
              <p className="text-[11px] text-slate-600 font-sans">
                Easy Monthly Installments & Consumer Electronics
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                Main Boulevard / Commercial Market, Pakistan
              </p>
              <p className="text-[10px] text-slate-500 font-sans">
                UAN: 0300-00-QISTS | Helpline: 042-38910000
              </p>
              <div className="mt-2 inline-block bg-slate-900 text-white font-urdu text-xs px-3 py-0.5 rounded-sm">
                {URDU_TERMS.receiptTitle}
              </div>
            </div>

            {/* Receipt Meta */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-slate-800">{receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contract ID:</span>
                <span className="font-semibold">{contract.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span>{receiptDate} 15:42 PST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recovery Officer:</span>
                <span className="truncate max-w-[170px]">{installment.collectedBy || contract.recoveryOfficerName}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{contract.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CNIC:</span>
                <span>{contract.customerCnic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span>{contract.customerMobile}</span>
              </div>
            </div>

            {/* Product & Asset Identification */}
            <div className="border-b border-dashed border-slate-300 pb-2 mb-2 text-[11px]">
              <div className="text-slate-500">Item Description:</div>
              <div className="font-bold text-slate-900">{contract.productName}</div>
              <div className="text-[10px] text-slate-600 mt-0.5 break-all">
                IMEI / Eng#: {contract.serialOrImei}
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="space-y-1.5 border-b-2 border-slate-800 pb-3 mb-3 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Installment No:</span>
                <span className="font-bold">
                  Month {installment.installmentNo} of {contract.tenureMonths}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">Monthly Due:</span>
                <span>{formatPKR(installment.amountDue)}</span>
              </div>
              {installment.lateFine > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Late Fee / Fine:</span>
                  <span>+{formatPKR(installment.lateFine)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-900">NET RECEIVED:</span>
                <span className="font-extrabold text-sm text-emerald-700">
                  {formatPKR(installment.amountPaid)}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Payment Mode:</span>
                <span className="font-semibold text-slate-700">{installment.paymentMethod || 'Cash'}</span>
              </div>
              {installment.transactionRef && (
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Txn Ref:</span>
                  <span>{installment.transactionRef}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] pt-1 border-t border-dashed border-slate-300">
                <span className="text-slate-600">Remaining Balance:</span>
                <span className="font-bold text-rose-700">{formatPKR(remaining)}</span>
              </div>
            </div>

            {/* QR Verification Placeholder */}
            <div className="text-center py-1">
              <div className="inline-block p-1.5 border border-slate-300 rounded bg-slate-50 mb-1">
                <div className="w-16 h-16 bg-slate-900 mx-auto flex items-center justify-center text-[9px] text-white text-center p-1 font-sans">
                  VERIFIED QR CODE
                </div>
              </div>
              <p className="text-[9px] text-slate-500 font-sans">Scan with QistBazaar App to verify payment authenticity</p>
            </div>

            {/* Urdu Terms / Legal Notice */}
            <div className="mt-2 text-center text-[9px] font-urdu leading-normal text-slate-700 border-t border-dashed border-slate-300 pt-2">
              {URDU_TERMS.disclaimer}
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-6 mt-2 text-[10px] font-sans border-t border-slate-200">
              <div className="text-center">
                <div className="w-20 border-b border-slate-400 mb-1"></div>
                <span className="text-slate-500">Customer Sign</span>
              </div>
              <div className="text-center">
                <div className="w-20 border-b border-slate-400 mb-1"></div>
                <span className="text-slate-500">Officer Stamp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-white">
          <a
            href={getWhatsAppLink(contract.customerMobile, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Send WhatsApp Receipt</span>
          </a>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print 80mm Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
