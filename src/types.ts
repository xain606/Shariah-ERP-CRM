export type PaymentMethod = 'Cash' | 'JazzCash' | 'EasyPaisa' | 'Raast' | 'Bank Transfer';

export type ContractStatus = 'active' | 'completed' | 'defaulter' | 'legal_action' | 'repossessed';

export type ProductCategory = 'Smartphones' | 'Motorcycles' | 'Home Appliances' | 'Solar Energy' | 'Laptops & IT';

export type InstallmentStatus = 'pending' | 'due' | 'paid' | 'overdue' | 'partial';

export interface Guarantor {
  id: string;
  fullName: string;
  fatherName: string;
  cnic: string;
  mobile: string;
  relationship: string;
  address: string;
  workplace?: string;
  verisysStatus: 'verified' | 'pending' | 'flagged';
}

export interface Customer {
  id: string;
  fullName: string;
  fatherName: string;
  cnic: string; // 35202-xxxxxxx-x
  mobile: string;
  alternateMobile?: string;
  address: string;
  city: string;
  residentialType: 'owned' | 'rented';
  electricityRefNo?: string; // LESCO / K-Electric / IESCO / GEPCO bill ref
  occupation: string;
  monthlyIncome: number;
  verisysStatus: 'verified' | 'pending' | 'flagged';
  riskScore: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Defaulter';
  documents: {
    cnicFront: boolean;
    cnicBack: boolean;
    utilityBill: boolean;
    salarySlip: boolean;
    securityCheque: boolean;
  };
}

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  model: string;
  cashPrice: number;
  costPrice: number;
  serialOrImei: string;
  secondaryImeiOrChassis?: string;
  status: 'In Stock' | 'Contract Assigned' | 'Repossessed';
  contractId?: string;
}

export interface InstallmentMonth {
  installmentNo: number;
  dueDate: string;
  amountDue: number;
  lateFine: number;
  amountPaid: number;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  receiptNo?: string;
  collectedBy?: string;
  status: InstallmentStatus;
}

export interface InstallmentContract {
  id: string; // e.g. "PK-QIST-2026-010"
  customerId: string;
  customerName: string;
  customerCnic: string;
  customerMobile: string;
  customerCity: string;
  guarantors: Guarantor[];
  productId: string;
  productName: string;
  category: ProductCategory;
  serialOrImei: string;
  cashPrice: number;
  markupPercentage: number;
  totalContractPrice: number;
  advancePaid: number;
  fileCharges: number;
  remainingBalance: number;
  tenureMonths: number;
  monthlyInstallment: number;
  startDate: string;
  dueDayOfMonth: number;
  status: ContractStatus;
  recoveryOfficerId: string;
  recoveryOfficerName: string;
  collateral: {
    securityChequeNo?: string;
    bankName?: string;
    stampPaperNo?: string;
    originalFileHeld?: boolean;
    imeiRemoteLocked?: boolean;
  };
  schedule: InstallmentMonth[];
  notes?: string;
}

export interface RecoveryOfficer {
  id: string;
  name: string;
  phone: string;
  assignedZone: string;
  targetMonthly: number;
  collectedThisMonth: number;
  cashInHandToday: number;
}

export interface OfflinePaymentRecord {
  id: string; // client uuid (idempotency key)
  contractId: string;
  customerName: string;
  customerMobile: string;
  installmentNo: number;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  recoveryOfficerName: string;
  receiptNo: string;
  timestamp: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  gpsLocation?: {
    lat: number;
    lng: number;
  };
}

export interface SyncBatchPayload {
  deviceFingerprint: string;
  officerName: string;
  transactions: OfflinePaymentRecord[];
}
