import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  Home,
  ShieldCheck,
  Zap,
  Building,
  UserPlus,
} from 'lucide-react';
import { Customer, InstallmentContract } from '../types';
import { formatPKR, formatCNIC } from '../utils/formatters';

interface CustomersAndGuarantorsProps {
  customers: Customer[];
  contracts: InstallmentContract[];
  onAddCustomer: (customer: Customer) => void;
  onSelectCustomerContract: (contract: InstallmentContract) => void;
}

export const CustomersAndGuarantors: React.FC<CustomersAndGuarantorsProps> = ({
  customers,
  contracts,
  onAddCustomer,
  onSelectCustomerContract,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Customer Form State
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [cnic, setCnic] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [residentialType, setResidentialType] = useState<'owned' | 'rented'>('owned');
  const [electricityRefNo, setElectricityRefNo] = useState('');
  const [occupation, setOccupation] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(60000);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.fullName.toLowerCase().includes(q) ||
      c.cnic.includes(q) ||
      c.mobile.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.occupation.toLowerCase().includes(q);

    const matchesRisk = riskFilter === 'all' || c.riskScore === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust: Customer = {
      id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      fullName,
      fatherName,
      cnic: formatCNIC(cnic),
      mobile,
      address,
      city,
      residentialType,
      electricityRefNo,
      occupation,
      monthlyIncome,
      verisysStatus: 'verified',
      riskScore: 'Low Risk',
      documents: {
        cnicFront: true,
        cnicBack: true,
        utilityBill: !!electricityRefNo,
        salarySlip: false,
        securityCheque: true,
      },
    };

    onAddCustomer(newCust);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name, CNIC (35202-...), Phone, City or Occupation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium"
          >
            <option value="all">All Risk Categories</option>
            <option value="Low Risk">Low Risk (Punctual)</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="High Risk">High Risk</option>
            <option value="Defaulter">Defaulters / Blacklisted</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Customer Dossier</span>
          </button>
        </div>
      </div>

      {/* Customer Dossier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const customerContracts = contracts.filter((c) => c.customerId === cust.id || c.customerCnic === cust.cnic);
          const activeContract = customerContracts.find((c) => c.status === 'active' || c.status === 'defaulter' || c.status === 'legal_action');

          return (
            <div
              key={cust.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cust.fullName}</h3>
                    <p className="text-xs text-slate-500">S/O {cust.fatherName}</p>
                    <div className="mt-1 font-mono text-xs text-slate-700 font-semibold">
                      CNIC: {cust.cnic}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      cust.riskScore === 'Defaulter'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : cust.riskScore === 'High Risk'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : cust.riskScore === 'Medium Risk'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {cust.riskScore}
                  </span>
                </div>

                {/* Details */}
                <div className="py-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mobile:</span>
                    <span className="font-semibold text-slate-800">{cust.mobile}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Occupation:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">
                      {cust.occupation}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Residence Type:</span>
                    <span className="font-medium text-slate-800 capitalize">
                      {cust.residentialType} (
                      {cust.residentialType === 'owned' ? 'ذاتی مکان' : 'کرایہ دار'})
                    </span>
                  </div>

                  {cust.electricityRefNo && (
                    <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Electricity Ref:
                      </span>
                      <span className="font-mono text-[11px] text-slate-700 truncate max-w-[150px]">
                        {cust.electricityRefNo}
                      </span>
                    </div>
                  )}

                  {/* Document Verification Checklist */}
                  <div className="pt-2">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                      KYC Documents on File
                    </div>
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          cust.documents.cnicFront
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        ✓ CNIC Front/Back
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          cust.documents.utilityBill
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        ✓ Utility Bill
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          cust.documents.securityCheque
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        ✓ Sec Cheque (489-F)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Contract Action */}
              <div className="pt-3 border-t border-slate-100">
                {activeContract ? (
                  <button
                    onClick={() => onSelectCustomerContract(activeContract)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center justify-between"
                  >
                    <span>Active: {activeContract.productName}</span>
                    <span className="font-mono">{formatPKR(activeContract.monthlyInstallment)}/mo</span>
                  </button>
                ) : (
                  <div className="text-center py-1.5 text-xs text-slate-400 italic">
                    No active contract (Clear History)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 my-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Register New Customer KYC File</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name (نام)</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Asim Raza"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Father's Name (ولدیت)</label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. Raza Hussain"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Pakistani CNIC (13 digits)
                  </label>
                  <input
                    type="text"
                    required
                    value={cnic}
                    onChange={(e) => setCnic(formatCNIC(e.target.value))}
                    placeholder="35202-XXXXXXX-X"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile Number (رابطہ نمبر)</label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lahore / Karachi / Rawalpindi"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Residential Status</label>
                  <select
                    value={residentialType}
                    onChange={(e) => setResidentialType(e.target.value as 'owned' | 'rented')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="owned">Owned House (ذاتی مکان)</option>
                    <option value="rented">Rented House (کرایہ دار)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Electricity Bill Consumer/Reference No (Address Proof)
                </label>
                <input
                  type="text"
                  value={electricityRefNo}
                  onChange={(e) => setElectricityRefNo(e.target.value)}
                  placeholder="e.g. LESCO-08-11234-9081234 or KE-04000..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Complete Residential Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Mohalla, Near landmark..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Occupation / Workplace</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Bank Officer / Tailor Master"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimated Monthly Income</label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Save Customer Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
