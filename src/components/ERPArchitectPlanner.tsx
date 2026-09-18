import React, { useState } from 'react';
import {
  Layers,
  Database,
  Scale,
  Cpu,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Terminal,
  FileCode,
  Smartphone,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { formatPKR } from '../utils/formatters';

export const ERPArchitectPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'modules' | 'legal_shariah' | 'database_erd' | 'hardware_tech' | 'financial_simulator'
  >('modules');

  const [copiedSchema, setCopiedSchema] = useState(false);

  // Financial Simulator State
  const [portfolioSize, setPortfolioSize] = useState<number>(25000000); // 2.5 Crore PKR
  const [averageTenure, setAverageTenure] = useState<number>(12); // 12 months
  const [averageMarkup, setAverageMarkup] = useState<number>(35); // 35% markup
  const [expectedDefaultRate, setExpectedDefaultRate] = useState<number>(4.5); // 4.5% default rate
  const [recoveryCommissionRate, setRecoveryCommissionRate] = useState<number>(2.0); // 2% of collected

  // Simulated metrics
  const totalMarkupRevenue = Math.round((portfolioSize * averageMarkup) / 100);
  const badDebtProvision = Math.round((portfolioSize * expectedDefaultRate) / 100);
  const recoveryCommissions = Math.round(((portfolioSize + totalMarkupRevenue) * recoveryCommissionRate) / 100);
  const netOperatingProfit = totalMarkupRevenue - badDebtProvision - recoveryCommissions;
  const netROI = Math.round((netOperatingProfit / portfolioSize) * 100);

  const postgresSchema = `-- PostgreSQL Database Schema for Pakistan Installment ERP & CRM
-- Localized for Pakistani CNIC, Guarantors, Collateral & Section 489-F PPC

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    cnic VARCHAR(15) UNIQUE NOT NULL, -- e.g. 35202-1234567-1
    mobile VARCHAR(15) NOT NULL,
    alt_mobile VARCHAR(15),
    residential_type VARCHAR(20) DEFAULT 'owned', -- 'owned' | 'rented'
    address TEXT NOT NULL,
    city VARCHAR(80) NOT NULL,
    electricity_ref_no VARCHAR(50), -- LESCO / K-Electric / IESCO ref
    occupation VARCHAR(100),
    monthly_income NUMERIC(12,2),
    verisys_status VARCHAR(20) DEFAULT 'pending',
    risk_tier VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE guarantors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    cnic VARCHAR(15) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    relationship VARCHAR(50) NOT NULL, -- Brother, Uncle, Colleague
    address TEXT NOT NULL,
    workplace TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Smartphones' | 'Motorcycles' | 'Appliances'
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(100),
    serial_or_imei_1 VARCHAR(100) UNIQUE NOT NULL,
    secondary_imei_or_chassis VARCHAR(100),
    cash_price NUMERIC(12,2) NOT NULL,
    cost_price NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'in_stock' -- 'in_stock' | 'contract_assigned' | 'repossessed'
);

CREATE TABLE installment_contracts (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'PK-QIST-2026-0042'
    customer_id UUID REFERENCES customers(id),
    inventory_item_id UUID REFERENCES inventory_items(id),
    cash_price NUMERIC(12,2) NOT NULL,
    markup_percentage NUMERIC(5,2) NOT NULL,
    total_contract_price NUMERIC(12,2) NOT NULL,
    advance_down_payment NUMERIC(12,2) NOT NULL,
    file_processing_charges NUMERIC(10,2) DEFAULT 2000,
    remaining_balance NUMERIC(12,2) NOT NULL,
    tenure_months INT NOT NULL,
    monthly_installment NUMERIC(12,2) NOT NULL,
    due_day_of_month INT DEFAULT 10,
    status VARCHAR(30) DEFAULT 'active', -- 'active' | 'completed' | 'defaulter' | 'legal'
    security_cheque_no VARCHAR(50),
    security_cheque_bank VARCHAR(100),
    stamp_paper_no VARCHAR(50),
    original_bike_file_held BOOLEAN DEFAULT FALSE,
    imei_remote_locked BOOLEAN DEFAULT FALSE,
    recovery_officer_id UUID,
    start_date DATE NOT NULL
);

CREATE TABLE installment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id VARCHAR(50) REFERENCES installment_contracts(id) ON DELETE CASCADE,
    installment_no INT NOT NULL,
    due_date DATE NOT NULL,
    amount_due NUMERIC(12,2) NOT NULL,
    late_fine NUMERIC(10,2) DEFAULT 0,
    amount_paid NUMERIC(12,2) DEFAULT 0,
    paid_date DATE,
    payment_method VARCHAR(30), -- 'Cash' | 'JazzCash' | 'EasyPaisa' | 'Raast'
    transaction_ref VARCHAR(100),
    receipt_no VARCHAR(50),
    collected_by VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' -- 'pending' | 'due' | 'paid' | 'overdue'
);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(postgresSchema);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Layers className="w-3.5 h-3.5" />
              <span>Enterprise Systems Architecture & Deployment Guide</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Pakistan Installment CRM / ERP Planning Blueprint
            </h2>
            <p className="mt-1 text-slate-300 text-sm max-w-3xl">
              Complete architectural roadmap tailored to the retail installment industry in Pakistan: NADRA KYC, 2-Zamin guarantor network, field recovery POS, Section 489-F PPC legal safeguards, and Shariah Murabaha compliance.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-emerald-500/30 text-xs">
            <span className="text-emerald-400 font-bold">Target Market:</span>
            <span className="text-slate-200">Mobile, Bikes & Home Electronics</span>
          </div>
        </div>

        {/* Blueprint Navigation Tabs */}
        <div className="flex space-x-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'modules'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. Core ERP Modules</span>
          </button>

          <button
            onClick={() => setActiveTab('legal_shariah')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'legal_shariah'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>2. Legal & Shariah Framework</span>
          </button>

          <button
            onClick={() => setActiveTab('database_erd')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'database_erd'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>3. Database ERD & DDL</span>
          </button>

          <button
            onClick={() => setActiveTab('hardware_tech')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'hardware_tech'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>4. Hardware & Field POS Kit</span>
          </button>

          <button
            onClick={() => setActiveTab('financial_simulator')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'financial_simulator'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>5. Financial Risk & Profit Model</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Core ERP Modules Breakdown */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Module 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Customer Onboarding & NADRA Verisys KYC
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Captures 13-digit CNIC, mobile number OTP verification, utility reference number (LESCO, K-Electric, IESCO for electricity address proof), and physical home verification by field staff.
            </p>
            <ul className="text-xs text-slate-500 space-y-1 pt-1 list-disc list-inside">
              <li>Biometric Verisys integration readiness</li>
              <li>Utility bill consumer verification</li>
              <li>Rented vs owned home tenure rating</li>
            </ul>
          </div>

          {/* Module 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Dual Guarantor (Zamin 1 & 2) Engine
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In Pakistan, retail installments rely heavily on 2 solid guarantors (government servant, reputable shopkeeper, or immediate relative). System tracks contact, relationship, and legal liability.
            </p>
            <ul className="text-xs text-slate-500 space-y-1 pt-1 list-disc list-inside">
              <li>Joint and several legal liability clauses</li>
              <li>Automated guarantor WhatsApp notifications</li>
              <li>Cross-guarantor exposure tracking</li>
            </ul>
          </div>

          {/* Module 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Amortization & Profit Markup Engine
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates cash price vs installment tenure pricing (3, 6, 9, 12, 18, 24 months), upfront advance/bayana, file processing fees, and day-of-month repayment amortization schedules.
            </p>
            <ul className="text-xs text-slate-500 space-y-1 pt-1 list-disc list-inside">
              <li>Flat markup vs reducing balance options</li>
              <li>Late fine auto-accrual or charity penalty</li>
              <li>Pre-closure and early settlement discounts</li>
            </ul>
          </div>

          {/* Module 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Field Recovery Officer Mobile Roznamcha
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Field agents carry smartphone PWA with Bluetooth thermal printers (Sunmi/Pax) to collect cash, JazzCash, EasyPaisa, or Raast at the customer doorstep and issue immediate authenticated receipts.
            </p>
            <ul className="text-xs text-slate-500 space-y-1 pt-1 list-disc list-inside">
              <li>Doorstep GPS geo-stamped check-ins</li>
              <li>Cash-in-hand daily evening reconciliation</li>
              <li>Instant 80mm thermal receipt slip printout</li>
            </ul>
          </div>

          {/* Module 5 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              05
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Asset Tracking & IMEI Remote Locking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track serial numbers for ACs/compressors, engine and chassis numbers for Atlas Honda motorcycles, and remote MDM cloud locking for smartphones (Samsung Knox Guard / PayJoy).
            </p>
            <ul className="text-xs text-slate-500 space-y-1 pt-1 list-disc list-inside">
              <li>Original motorcycle file safe custody tracker</li>
              <li>48-hour automated smartphone screen lock</li>
              <li>Repossession team dispatch protocol</li>
            </ul>
          </div>

          {/* Module 6 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              06
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              Section 489-F PPC & Legal Escalation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Under Section 489-F of the Pakistan Penal Code, bouncing a cheque is a cognizable criminal offense. ERP manages cheque presentation, bank dishonor slips, 7-day legal notices, and FIR filing.
            </p>
            <ul className="text-xs text-slate-500 space-y-1 pt-1 list-disc list-inside">
              <li>Automated advocate legal notice generator</li>
              <li>Bank cheque dishonor memo archiving</li>
              <li>FIR & Summary Court suit tracking (Order 37)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Legal & Shariah Framework */}
      {activeTab === 'legal_shariah' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-700" />
              <span>Pakistani Legal Framework & Regulatory Safeguards</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Standard commercial practices protecting capital in Punjab, Sindh, KPK, and Balochistan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">1. Section 489-F Pakistan Penal Code (PPC)</h4>
              <p className="leading-relaxed">
                "Whoever dishonestly issues a cheque towards repayment of a loan or fulfillment of an obligation which is dishonoured on presentation shall be punishable with imprisonment which may extend to three years, or with fine, or with both."
              </p>
              <div className="text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                <strong>ERP Implementation:</strong> Customers provide an undated signed security cheque covering the full remaining value. If default exceeds 60 days, cheque is presented, bank dishonor memo received, and 7-day advocate notice issued under Section 489-F.
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">2. Non-Judicial Stamp Paper (Iqrarnama / اقرار نامہ)</h4>
              <p className="leading-relaxed">
                Executes contract on provincial government stamp paper (e.g. Rs. 100 or Rs. 1,200 Punjab/Sindh e-stamp paper). Explicitly includes acknowledgment of debt, repossession authority, and guarantor liability.
              </p>
              <div className="text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                <strong>Clauses Required:</strong> Retention of title until final installment clearance; authority to repossess without court warrant if arrears exceed 2 months; irrevocable guarantor indemnity.
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <h4 className="font-bold text-emerald-950 text-sm">3. Islamic Shariah Murabaha / Musawamah Structure</h4>
              <p className="leading-relaxed">
                To operate under Shariah compliance without conventional interest (Riba), the business buys the goods from the distributor first into its constructive possession, then sells them to the customer at a declared cost-plus profit (Murabaha) with fixed monthly payments.
              </p>
              <div className="text-[11px] text-emerald-800 bg-white p-3 rounded-lg border border-emerald-200">
                <strong>Late Payment Penalty:</strong> Under Islamic finance, late fines cannot be taken as profit by the business; they must be credited to a designated charity account (Sadaqah fund) or waived for genuine distress.
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">4. Motorcycle Original File Custody Protocol</h4>
              <p className="leading-relaxed">
                For motorcycles (Atlas Honda, Yamaha, United), the original registration book/file is withheld in the business's fireproof safe. The customer is given a certified copy and installment contract card. Upon final installment receipt, the original file is signed over with transfer letter.
              </p>
              <div className="text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                <strong>Excise & Taxation Status:</strong> File contains Form F, sales tax invoice, dealer delivery challan, and excise clearance.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Database ERD & DDL */}
      {activeTab === 'database_erd' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-700" />
                <span>PostgreSQL Relational Schema & Data Dictionary</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ready-to-deploy SQL schema designed for high-concurrency installment transactions.
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-[11px] font-mono text-emerald-400 leading-relaxed border border-slate-800">
            <pre>{postgresSchema}</pre>
          </div>
        </div>
      )}

      {/* Tab 4: Hardware & Field POS Kit */}
      {activeTab === 'hardware_tech' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-700" />
              <span>Recommended Hardware & Field Technology Stack</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Optimized for Pakistani retail and field recovery realities in urban bazaars and rural towns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="font-bold text-slate-900 text-sm">Sunmi V2 / Pax Thermal Handheld POS</div>
              <p className="text-slate-600">
                Android handheld terminals with integrated 58mm/80mm thermal receipt printers, 4G SIM card slot, and barcode/QR scanner. Ideal for recovery officers on motorbikes.
              </p>
              <div className="text-[11px] font-semibold text-emerald-700">
                Price in PK: Approx Rs. 35,000 - 55,000 / device
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="font-bold text-slate-900 text-sm">Samsung Knox Guard / PayJoy MDM</div>
              <p className="text-slate-600">
                Cloud-managed mobile device management (MDM) profile installed on financed smartphones at point of sale. If payment is 48 hours overdue, the screen locks automatically with a payment prompt.
              </p>
              <div className="text-[11px] font-semibold text-emerald-700">
                Cost: ~Rs. 1,000 - 1,500 per license (passed into file charges)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="font-bold text-slate-900 text-sm">Pakistani SMS Gateway (Zong / Jazz / Telenor)</div>
              <p className="text-slate-600">
                Masked SMS (e.g. "QIST-BAZAAR") API integration for automated payment confirmations and due reminders, plus WhatsApp Cloud API for rich receipts.
              </p>
              <div className="text-[11px] font-semibold text-emerald-700">
                Cost: ~Rs. 0.40 per SMS via local aggregator (e.g. Brandverse / Telecard)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Financial Risk & Bad Debt Simulator */}
      {activeTab === 'financial_simulator' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-700" />
              <span>Interactive Portfolio Risk & Bad-Debt Provisioning Calculator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Simulate cash flow returns, bad debt buffers, and recovery agent commission payouts across portfolio sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* Controls */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">Portfolio Inputs</h4>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Financed Portfolio Principal (PKR):</span>
                  <span className="font-bold text-emerald-700 text-sm">{formatPKR(portfolioSize)}</span>
                </div>
                <input
                  type="range"
                  min={5000000}
                  max={100000000}
                  step={1000000}
                  value={portfolioSize}
                  onChange={(e) => setPortfolioSize(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Rs. 50 Lakh (5M)</span>
                  <span>Rs. 10 Crore (100M)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Average Markup / Profit Percentage:</span>
                  <span className="font-bold text-slate-900 text-sm">{averageMarkup}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={55}
                  step={1}
                  value={averageMarkup}
                  onChange={(e) => setAverageMarkup(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>20% (6 Months)</span>
                  <span>55% (24 Months)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Expected Non-Performing Loan / Default Rate:</span>
                  <span className="font-bold text-rose-700 text-sm">{expectedDefaultRate}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={0.5}
                  value={expectedDefaultRate}
                  onChange={(e) => setExpectedDefaultRate(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1% (Pristine)</span>
                  <span>12% (High Risk)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Recovery Officer Field Commission Rate:</span>
                  <span className="font-bold text-slate-900 text-sm">{recoveryCommissionRate}%</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={recoveryCommissionRate}
                  onChange={(e) => setRecoveryCommissionRate(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0.5% of collection</span>
                  <span>5.0% of collection</span>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">Projected Annual Financials</h4>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-600">Gross Contract Portfolio Value:</span>
                    <span className="font-bold text-slate-900">
                      {formatPKR(portfolioSize + totalMarkupRevenue)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 text-emerald-900">
                    <span>Gross Markup Revenue:</span>
                    <span className="font-bold">{formatPKR(totalMarkupRevenue)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-rose-50 text-rose-900">
                    <span>Bad Debt Reserve Provision ({expectedDefaultRate}%):</span>
                    <span className="font-bold">-{formatPKR(badDebtProvision)}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 text-slate-700">
                    <span>Field Recovery Commissions ({recoveryCommissionRate}%):</span>
                    <span className="font-bold">-{formatPKR(recoveryCommissions)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 text-white mt-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-emerald-400">
                        Net Operating Profit
                      </div>
                      <div className="text-lg font-extrabold">{formatPKR(netOperatingProfit)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-300">Net Return on Capital</div>
                      <div className="text-lg font-extrabold text-emerald-400">{netROI}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-normal p-3 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <strong>Planner Takeaway:</strong> In Pakistan, maintaining default rates below 5% through 2 verified guarantors, Section 489-F security cheques, and IMEI remote locking allows a 35% markup portfolio to yield a healthy <strong>{netROI}% net return</strong> on deployed capital.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
