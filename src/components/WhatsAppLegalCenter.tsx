import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Phone,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { InstallmentContract } from '../types';
import { formatPKR, getWhatsAppLink } from '../utils/formatters';

interface WhatsAppLegalCenterProps {
  contracts: InstallmentContract[];
}

export const WhatsAppLegalCenter: React.FC<WhatsAppLegalCenterProps> = ({ contracts }) => {
  const [selectedContractId, setSelectedContractId] = useState<string>(contracts[0]?.id || '');
  const [templateKey, setTemplateKey] = useState<string>('due_reminder');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || contracts[0];
  const nextUnpaid =
    selectedContract?.schedule.find((s) => s.status === 'due' || s.status === 'overdue') ||
    selectedContract?.schedule[0];

  const zamin = selectedContract?.guarantors[0];

  // Dynamic templates for Pakistan Installments
  const generateMessage = (key: string): string => {
    if (!selectedContract || !nextUnpaid) return '';

    const custName = selectedContract.customerName;
    const prodName = selectedContract.productName;
    const qistAmount = formatPKR(nextUnpaid.amountDue);
    const dueDate = nextUnpaid.dueDate;
    const overdueTotal = formatPKR(
      selectedContract.schedule
        .filter((s) => s.status === 'overdue')
        .reduce((sum, s) => sum + s.amountDue + s.lateFine, 0) || nextUnpaid.amountDue
    );

    switch (key) {
      case 'due_reminder':
        return `*QISTBAZAAR PAKISTAN - قسط یاددہانی* 🔔
محترم جناب ${custName} صاحب،
السلام علیکم!
امید ہے آپ بخیریت ہوں گے۔ یاددہانی کرائی جاتی ہے کہ آپ کے قسط معاہدہ (${selectedContract.id}) برائے *${prodName}* کی ماہانہ قسط *${qistAmount}* بتاریخ *${dueDate}* واجب الادا ہے۔

براہِ کرم بروقت ادائیگی فرمائیں یا ہمارے شاپ کاؤنٹر / JazzCash / EasyPaisa پر جمع کروائیں۔
جزاک اللہ خیر!
*قسط بازار ہیلپ لائن: 0300-00-QISTS*`;

      case 'overdue_warning':
        return `*IMPORTANT NOTICE: QIST DELAY ALERT* ⚠️
جناب ${custName} صاحب (CNIC: ${selectedContract.customerCnic})،
مطلع کیا جاتا ہے کہ آپ کے سامان *${prodName}* کی قسط بتاریخ ${dueDate} واجب الادا تھی جو ابھی تک جمع نہیں ہوئی۔
کل بقایا رقم: *${overdueTotal}*

تاخیری جرمانے اور سروس لاک سے بچنے کے لیے اگلے 24 گھنٹوں میں قسط ادا فرمائیں۔
شکریہ، شعبہ ریکوری قسط بازار۔`;

      case 'zamin_notice':
        return `*URGENT NOTICE TO GUARANTOR (اطلاع برائے ضامن)* 👥
محترم جناب ${zamin?.fullName || 'ضامن صاحب'}،
السلام علیکم!
آپ نے جناب *${custName}* ولدیت کے سامان *${prodName}* کے قسط معاہدہ (#${selectedContract.id}) میں بطور ضامن (Guarantor) حلفیہ ضمانت دی تھی۔
مذکورہ گاہک کی قسط واجب الادا بقایا ہے اور بارہا رابطے کے باوجود ادائیگی نہیں ہوئی۔

بطور ضامن آپ سے التماس ہے کہ گاہک سے رابطہ کروا کر قسط فوری جمع کروائیں، بصورتِ دیگر معاہدے کے تحت قانونی کارروائی شروع کی جائے گی۔
*قسط بازار لیگل اینڈ ریکوری برانچ*`;

      case 'legal_notice_489f':
        return `*FINAL LEGAL NOTICE UNDER SECTION 489-F PPC & SUMMARY PROCEDURE* ⚖️
بخدمت: جناب ${custName} (شناختی کارڈ: ${selectedContract.customerCnic})
بمقام: ${selectedContract.customerCity}

آپ کو مطلع کیا جاتا ہے کہ سامان *${prodName}* (چیسس/IMEI: ${selectedContract.serialOrImei}) کی اقساط بقایا جات کی عدم ادائیگی کی صورت میں آپ کا جاری کردہ سکیورٹی چیک نمبر *${
          selectedContract.collateral.securityChequeNo || 'CHK-XXXXXX'
        }* برائے بینک ${
          selectedContract.collateral.bankName || 'مقررہ بینک'
        } ڈس آنر (Bounce) ہو چکا ہے۔

آپ کو 7 یوم کا آخری نوٹس دیا جاتا ہے کہ بقایا جات ادا کریں بصورت دیگر:
1. تعزیراتِ پاکستان دفعہ 489-F PPC کے تحت پولیس میں FIR کا اندراج۔
2. سامان کی قانونی برآمدگی (Repossession)۔
3. ضامن صاحبان کے خلاف عدالتی کارروائی عمل میں لائی جائے گی۔
*ایڈووکیٹ ہائی کورٹ برائے قسط بازار کارپوریشن*`;

      case 'payment_confirmation':
        return `*ALHAMDULILLAH - PAYMENT RECEIVED* ✅
محترم ${custName} صاحب،
آپ کی قسط نمبر ${nextUnpaid.installmentNo} برائے ${prodName} مبلغ *${qistAmount}* باخیر وصول ہو چکی ہے۔
بقیہ واجب الادا بیلنس: *${formatPKR(selectedContract.remainingBalance)}*
قسط بازار پر اعتماد کا شکریہ!`;

      default:
        return '';
    }
  };

  const currentMessage = generateMessage(templateKey);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              WhatsApp & Legal Escalation Center (اطلاعات و نوٹسز)
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              One-Click Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch Urdu & Roman Urdu due reminders, guarantor notices, and Section 489-F PPC legal alerts directly to Pakistani mobile numbers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppLink(
              selectedContract?.customerMobile || '',
              currentMessage
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Launch WhatsApp Now</span>
          </a>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Contract & Templates */}
        <div className="lg:col-span-5 space-y-4">
          {/* Contract Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Select Customer Contract
            </label>
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
            >
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerName} ({c.id}) - {c.productName} [{c.status}]
                </option>
              ))}
            </select>

            {selectedContract && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile:</span>
                  <span className="font-semibold text-slate-900">{selectedContract.customerMobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CNIC:</span>
                  <span className="font-mono text-slate-800">{selectedContract.customerCnic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guarantor (ضامن):</span>
                  <span className="font-medium text-slate-800">
                    {selectedContract.guarantors[0]?.fullName || 'No Guarantor on file'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Template Selection Tabs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              2. Select Message Escalation Stage
            </label>

            <button
              onClick={() => setTemplateKey('due_reminder')}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                templateKey === 'due_reminder'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold">1. Polite Due Reminder (قسط کی یاددہانی)</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Sent 3 days prior to monthly due date in Urdu
                </div>
              </div>
            </button>

            <button
              onClick={() => setTemplateKey('overdue_warning')}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                templateKey === 'overdue_warning'
                  ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold">2. Overdue Delay Notice (تاخیری انتباہ)</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Urgent notice warning of late fines and IMEI lock
                </div>
              </div>
            </button>

            <button
              onClick={() => setTemplateKey('zamin_notice')}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                templateKey === 'zamin_notice'
                  ? 'bg-blue-50 border-blue-300 text-blue-950 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold">3. Guarantor Escalation (ضامن کو اطلاع)</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Informs Zamin of borrower delinquency under agreement
                </div>
              </div>
            </button>

            <button
              onClick={() => setTemplateKey('legal_notice_489f')}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                templateKey === 'legal_notice_489f'
                  ? 'bg-purple-50 border-purple-300 text-purple-950 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Scale className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold">4. Section 489-F PPC Cheque Notice (قانونی نوٹس)</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Formal legal demand before FIR and police repossession
                </div>
              </div>
            </button>

            <button
              onClick={() => setTemplateKey('payment_confirmation')}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                templateKey === 'payment_confirmation'
                  ? 'bg-teal-50 border-teal-300 text-teal-950 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileCheck className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold">5. Payment Received Acknowledgment</div>
                <div className="text-[11px] text-slate-500 font-normal">
                  Confirms receipt of installment and remaining balance
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Message Preview & Dispatch */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 text-sm">
                  Live Message Preview (WhatsApp / SMS Format)
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            {/* WhatsApp Phone Mockup Bubble */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200/70">
              <div className="max-w-md mx-auto bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 font-sans text-xs whitespace-pre-line leading-relaxed text-slate-800">
                {currentMessage}
              </div>
              <div className="text-center mt-2 text-[11px] text-slate-500">
                Target Recipient: {selectedContract?.customerMobile} ({selectedContract?.customerName})
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500">
                Format: UTF-8 Urdu & English | No special gateway required
              </div>

              <div className="flex gap-2">
                <a
                  href={getWhatsAppLink(
                    selectedContract?.customerMobile || '',
                    currentMessage
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send to Customer via WhatsApp</span>
                </a>

                {templateKey === 'zamin_notice' && zamin && (
                  <a
                    href={getWhatsAppLink(zamin.mobile, currentMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send to Guarantor ({zamin.mobile})</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
