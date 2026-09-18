import React, { useState } from 'react';
import {
  X,
  Calculator,
  ShieldCheck,
  UserCheck,
  Smartphone,
  Lock,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { Customer, InstallmentContract, ProductCategory, ProductItem, RecoveryOfficer } from '../types';
import { formatPKR, formatCNIC } from '../utils/formatters';

interface NewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  products: ProductItem[];
  recoveryOfficers: RecoveryOfficer[];
  onCreateContract: (newContract: InstallmentContract) => void;
}

export const NewContractModal: React.FC<NewContractModalProps> = ({
  isOpen,
  onClose,
  customers,
  products,
  recoveryOfficers,
  onCreateContract,
}) => {
  if (!isOpen) return null;

  // Selected product / custom product
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [customProductName, setCustomProductName] = useState<string>('');
  const [category, setCategory] = useState<ProductCategory>('Motorcycles');
  const [cashPrice, setCashPrice] = useState<number>(157900);
  const [serialOrImei, setSerialOrImei] = useState<string>('ENG-CD70-881920 / CHS-882910');

  // Installment Terms
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [markupPercentage, setMarkupPercentage] = useState<number>(35);
  const [advancePaid, setAdvancePaid] = useState<number>(45000);
  const [fileCharges, setFileCharges] = useState<number>(2500);
  const [dueDayOfMonth, setDueDayOfMonth] = useState<number>(10);
  const [recoveryOfficerId, setRecoveryOfficerId] = useState<string>(recoveryOfficers[0]?.id || '');

  // Customer
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustFather, setNewCustFather] = useState<string>('');
  const [newCustCnic, setNewCustCnic] = useState<string>('');
  const [newCustMobile, setNewCustMobile] = useState<string>('');
  const [newCustCity, setNewCustCity] = useState<string>('Lahore');
  const [newCustAddress, setNewCustAddress] = useState<string>('');

  // Guarantors (Zamin 1 & Zamin 2)
  const [zamin1Name, setZamin1Name] = useState<string>('Abdul Razzaq');
  const [zamin1Cnic, setZamin1Cnic] = useState<string>('35202-1829104-5');
  const [zamin1Mobile, setZamin1Mobile] = useState<string>('0302-9918234');
  const [zamin1Rel, setZamin1Rel] = useState<string>('Brother');
  const [zamin1Address, setZamin1Address] = useState<string>('Shahdara, Lahore');

  const [zamin2Name, setZamin2Name] = useState<string>('Sheikh Naeem');
  const [zamin2Cnic, setZamin2Cnic] = useState<string>('35202-9284019-1');
  const [zamin2Mobile, setZamin2Mobile] = useState<string>('0321-4829102');
  const [zamin2Rel, setZamin2Rel] = useState<string>('Shopkeeper Neighbor');
  const [zamin2Address, setZamin2Address] = useState<string>('Main Bazar Shahdara');

  // Collateral Safeguards
  const [securityChequeNo, setSecurityChequeNo] = useState<string>('CHK-MBL-8819203');
  const [bankName, setBankName] = useState<string>('Meezan Bank Ltd');
  const [stampPaperNo, setStampPaperNo] = useState<string>('STAMP-PB-2026-991');
  const [originalFileHeld, setOriginalFileHeld] = useState<boolean>(true);
  const [imeiRemoteLocked, setImeiRemoteLocked] = useState<boolean>(false);

  // Auto update product info if chosen from dropdown
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    if (prodId === 'custom') {
      setCustomProductName('New Custom Item');
      setCashPrice(50000);
      setSerialOrImei('');
    } else {
      const p = products.find((x) => x.id === prodId);
      if (p) {
        setCustomProductName(p.name);
        setCategory(p.category);
        setCashPrice(p.cashPrice);
        setSerialOrImei(p.serialOrImei + (p.secondaryImeiOrChassis ? ` / ${p.secondaryImeiOrChassis}` : ''));
        // If motorcycle, hold file; if smartphone, default IMEI lock
        setOriginalFileHeld(p.category === 'Motorcycles');
        setImeiRemoteLocked(p.category === 'Smartphones');
      }
    }
  };

  // Calculations
  const markupAmount = Math.round((cashPrice * markupPercentage) / 100);
  const totalContractPrice = cashPrice + markupAmount + fileCharges;
  const balanceAfterAdvance = Math.max(0, totalContractPrice - advancePaid);
  const monthlyInstallment = Math.round(balanceAfterAdvance / (tenureMonths || 1));

  const handleGenerate = () => {
    let customerName = '';
    let customerCnic = '';
    let customerMobile = '';
    let customerCity = '';
    let custId = '';

    if (customerMode === 'existing') {
      const c = customers.find((x) => x.id === selectedCustomerId) || customers[0];
      custId = c.id;
      customerName = c.fullName;
      customerCnic = c.cnic;
      customerMobile = c.mobile;
      customerCity = c.city;
    } else {
      custId = `CUST-${Math.floor(100 + Math.random() * 900)}`;
      customerName = newCustName || 'New Client';
      customerCnic = newCustCnic || '35202-0000000-0';
      customerMobile = newCustMobile || '0300-0000000';
      customerCity = newCustCity || 'Pakistan';
    }

    const prodName =
      selectedProductId === 'custom'
        ? customProductName || 'Custom Item'
        : products.find((x) => x.id === selectedProductId)?.name || 'Installment Product';

    const officer = recoveryOfficers.find((o) => o.id === recoveryOfficerId) || recoveryOfficers[0];

    // Generate schedule
    const schedule = [];
    const today = new Date();
    for (let i = 1; i <= tenureMonths; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, dueDayOfMonth);
      const dateStr = d.toISOString().split('T')[0];
      schedule.push({
        installmentNo: i,
        dueDate: dateStr,
        amountDue: monthlyInstallment,
        lateFine: 0,
        amountPaid: 0,
        status: i === 1 ? ('due' as const) : ('pending' as const),
      });
    }

    const contractId = `PK-QIST-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newContract: InstallmentContract = {
      id: contractId,
      customerId: custId,
      customerName,
      customerCnic,
      customerMobile,
      customerCity,
      productId: selectedProductId,
      productName: prodName,
      category,
      serialOrImei: serialOrImei || 'SN-PENDING',
      cashPrice,
      markupPercentage,
      totalContractPrice,
      advancePaid,
      fileCharges,
      remainingBalance: balanceAfterAdvance,
      tenureMonths,
      monthlyInstallment,
      startDate: new Date().toISOString().split('T')[0],
      dueDayOfMonth,
      status: 'active',
      recoveryOfficerId: officer.id,
      recoveryOfficerName: officer.name,
      collateral: {
        securityChequeNo,
        bankName,
        stampPaperNo,
        originalFileHeld,
        imeiRemoteLocked,
      },
      guarantors: [
        {
          id: `GUA-${Math.floor(100 + Math.random() * 900)}`,
          fullName: zamin1Name,
          fatherName: 'Father',
          cnic: zamin1Cnic,
          mobile: zamin1Mobile,
          relationship: zamin1Rel,
          address: zamin1Address,
          verisysStatus: 'verified',
        },
        {
          id: `GUA-${Math.floor(100 + Math.random() * 900)}`,
          fullName: zamin2Name,
          fatherName: 'Father',
          cnic: zamin2Cnic,
          mobile: zamin2Mobile,
          relationship: zamin2Rel,
          address: zamin2Address,
          verisysStatus: 'verified',
        },
      ],
      schedule,
    };

    onCreateContract(newContract);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                New Installment Contract (نیا معاہدہ اقساط)
              </h2>
              <p className="text-xs text-slate-500">
                Amortization calculation with Pakistani CNIC verification & 2 Guarantors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Product Selection & Pricing */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>1. Product & Asset Identification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Select Inventory Item</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatPKR(p.cashPrice)})
                    </option>
                  ))}
                  <option value="custom">+ Other / Custom Asset</option>
                </select>
              </div>

              {selectedProductId === 'custom' && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Custom Product Name</label>
                  <input
                    type="text"
                    value={customProductName}
                    onChange={(e) => setCustomProductName(e.target.value)}
                    placeholder="e.g. Dawlance Microwave Oven"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-medium mb-1">Asset Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Motorcycles">Motorcycles (Honda / Yamaha)</option>
                  <option value="Smartphones">Smartphones (Samsung / Redmi / iPhone)</option>
                  <option value="Home Appliances">Home Appliances (AC, Fridge, LED)</option>
                  <option value="Solar Energy">Solar Inverter / Battery Systems</option>
                  <option value="Laptops & IT">Laptops & IT Gear</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Cash Price (PKR Rs.)</label>
                <input
                  type="number"
                  value={cashPrice}
                  onChange={(e) => setCashPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">
                  Serial / IMEI / Engine / Chassis Numbers
                </label>
                <input
                  type="text"
                  value={serialOrImei}
                  onChange={(e) => setSerialOrImei(e.target.value)}
                  placeholder="e.g. 359182049182741 or ENG-CD70-881920"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Installment Plan & Markup Calculator */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-emerald-950 flex items-center gap-1.5 text-sm">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <span>2. Installment Terms & Profit Calculator (قسط اور منافع)</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Real-Time Amortization
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Tenure (Duration)</label>
                <select
                  value={tenureMonths}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setTenureMonths(m);
                    // Standard Pakistan installment market defaults:
                    if (m === 3) setMarkupPercentage(15);
                    else if (m === 6) setMarkupPercentage(25);
                    else if (m === 9) setMarkupPercentage(30);
                    else if (m === 12) setMarkupPercentage(35);
                    else if (m === 18) setMarkupPercentage(45);
                    else if (m === 24) setMarkupPercentage(55);
                  }}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-semibold text-slate-900"
                >
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months (Half Year)</option>
                  <option value={9}>9 Months</option>
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={18}>18 Months</option>
                  <option value={24}>24 Months (2 Years)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Markup / Profit %</label>
                <input
                  type="number"
                  value={markupPercentage}
                  onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Advance / Down Payment (Bayana)
                </label>
                <input
                  type="number"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">File / Stamp Charges</label>
                <input
                  type="number"
                  value={fileCharges}
                  onChange={(e) => setFileCharges(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Calculated Results Banner */}
            <div className="p-3 bg-white rounded-xl border border-emerald-300 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Price</div>
                <div className="font-bold text-slate-900 text-sm">{formatPKR(totalContractPrice)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Profit (Munafa)</div>
                <div className="font-bold text-emerald-700 text-sm">{formatPKR(markupAmount)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Remaining Bal.</div>
                <div className="font-bold text-slate-900 text-sm">{formatPKR(balanceAfterAdvance)}</div>
              </div>
              <div className="bg-emerald-600 text-white rounded-lg p-1.5">
                <div className="text-[10px] uppercase font-bold text-emerald-100">Monthly Qist</div>
                <div className="font-extrabold text-sm">{formatPKR(monthlyInstallment)}</div>
              </div>
            </div>
          </div>

          {/* Section 3: Customer Information */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>3. Customer Verification & KYC</span>
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerMode('existing')}
                  className={`px-2.5 py-1 rounded-lg font-semibold ${
                    customerMode === 'existing'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  Existing Customer
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('new')}
                  className={`px-2.5 py-1 rounded-lg font-semibold ${
                    customerMode === 'new'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  + Add New Client
                </button>
              </div>
            </div>

            {customerMode === 'existing' ? (
              <div>
                <label className="block text-slate-600 font-medium mb-1">Select Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} — CNIC: {c.cnic} ({c.city})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Asad Ullah"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Father's Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Muhammad Afzal"
                    value={newCustFather}
                    onChange={(e) => setNewCustFather(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Pakistani CNIC (13 digits)</label>
                  <input
                    type="text"
                    placeholder="35202-XXXXXXX-X"
                    value={newCustCnic}
                    onChange={(e) => setNewCustCnic(formatCNIC(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={newCustMobile}
                    onChange={(e) => setNewCustMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Lahore / Karachi / Rawalpindi"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Current Residential Address</label>
                  <input
                    type="text"
                    placeholder="House / Street / Mohalla"
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: 2 Guarantors (Zamin) */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>4. Guarantors / Zamin (Mandatory in Pakistani Installment Market)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Zamin 1 */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-xs">ضامن اوّل (Guarantor 1)</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={zamin1Name}
                    onChange={(e) => setZamin1Name(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Relation (Brother, Chacha)"
                    value={zamin1Rel}
                    onChange={(e) => setZamin1Rel(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="CNIC (35202-...)"
                    value={zamin1Cnic}
                    onChange={(e) => setZamin1Cnic(formatCNIC(e.target.value))}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Mobile 03XX..."
                    value={zamin1Mobile}
                    onChange={(e) => setZamin1Mobile(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Guarantor 1 Address / Shop"
                  value={zamin1Address}
                  onChange={(e) => setZamin1Address(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Zamin 2 */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 text-xs">ضامن دوم (Guarantor 2)</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={zamin2Name}
                    onChange={(e) => setZamin2Name(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Relation (Neighbor/Colleague)"
                    value={zamin2Rel}
                    onChange={(e) => setZamin2Rel(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="CNIC (35202-...)"
                    value={zamin2Cnic}
                    onChange={(e) => setZamin2Cnic(formatCNIC(e.target.value))}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Mobile 03XX..."
                    value={zamin2Mobile}
                    onChange={(e) => setZamin2Mobile(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Guarantor 2 Address / Shop"
                  value={zamin2Address}
                  onChange={(e) => setZamin2Address(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Legal Collateral & Security Safeguards */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>5. Legal Collateral & Security Clauses (ضمانتی دستاویزات)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Undated Security Cheque # (Section 489-F PPC)
                </label>
                <input
                  type="text"
                  placeholder="CHK-MBL-881920"
                  value={securityChequeNo}
                  onChange={(e) => setSecurityChequeNo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Meezan Bank, HBL, MCB"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Legal Stamp Paper Affidavit #
                </label>
                <input
                  type="text"
                  placeholder="STAMP-PB-881920"
                  value={stampPaperNo}
                  onChange={(e) => setStampPaperNo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={originalFileHeld}
                  onChange={(e) => setOriginalFileHeld(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Hold Original Bike Registration Book/File until Final Clearance</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={imeiRemoteLocked}
                  onChange={(e) => setImeiRemoteLocked(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Activate Remote IMEI Cloud Lock (Samsung Knox / PayJoy / Mobile Locker)</span>
              </label>
            </div>
          </div>

          {/* Section 6: Recovery Officer Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Assign Field Recovery Officer
              </label>
              <select
                value={recoveryOfficerId}
                onChange={(e) => setRecoveryOfficerId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
              >
                {recoveryOfficers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.assignedZone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Due Day of Each Month (تاریخ ادائیگی)
              </label>
              <select
                value={dueDayOfMonth}
                onChange={(e) => setDueDayOfMonth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
              >
                <option value={1}>1st of Month</option>
                <option value={5}>5th of Month</option>
                <option value={10}>10th of Month</option>
                <option value={15}>15th of Month</option>
                <option value={20}>20th of Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="text-xs text-slate-600">
            Net Monthly Qist: <strong className="text-emerald-700 font-bold">{formatPKR(monthlyInstallment)}</strong> × {tenureMonths} Months
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Issue Installment Contract & Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
