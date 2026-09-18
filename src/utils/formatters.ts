export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'Rs.');
}

export function formatCNIC(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

export function isValidCNIC(cnic: string): boolean {
  const clean = cnic.replace(/\D/g, '');
  return clean.length === 13;
}

export function formatPakMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('92')) {
    return '0' + digits.slice(2);
  }
  return raw;
}

export function getWhatsAppLink(phone: string, text: string): string {
  // convert 03001234567 to 923001234567
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '92' + clean.slice(1);
  } else if (!clean.startsWith('92')) {
    clean = '92' + clean;
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

export const URDU_TERMS = {
  bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  receiptTitle: 'رسید وصولی برائے اقساط',
  customerName: 'نام گاہک',
  fatherName: 'ولدیت',
  cnic: 'شناختی کارڈ نمبر',
  productName: 'تفصیل سامان',
  installmentNo: 'قسط نمبر',
  totalInstallments: 'کل اقساط',
  amountPaid: 'وصول شدہ رقم',
  lateFine: 'تاخیری جرمانہ',
  remainingBalance: 'بقیہ واجب الادا',
  paymentMethod: 'طریقہ ادائیگی',
  officerSignature: 'دستخط ریکوری آفیسر',
  customerSignature: 'دستخط گاہک',
  disclaimer: 'نوٹ: سامان کی ملکیت آخری قسط کی مکمل ادائیگی تک ادارے کے پاس رہے گی۔ قسط بر وقت ادا نہ کرنے کی صورت میں سامان واپس لینے کا حق محفوظ ہے۔',
};
