import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Wallet,
  Building2,
  FileCheck,
  Send,
  UserCheck,
} from 'lucide-react';
import { InstallmentContract, RecoveryOfficer } from '../types';
import { formatPKR, getWhatsAppLink } from '../utils/formatters';

interface OverviewDashboardProps {
  contracts: InstallmentContract[];
  recoveryOfficers: RecoveryOfficer[];
  onSelectContract: (contract: InstallmentContract) => void;
  openNewContractModal: () => void;
  switchToTab: (tab: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  contracts,
  recoveryOfficers,
  onSelectContract,
  openNewContractModal,
  switchToTab,
}) => {
  // Aggregate portfolio metrics
  const totalPortfolioValue = contracts.reduce((sum, c) => sum + c.totalContractPrice, 0);
  const totalRemainingBalance = contracts.reduce((sum, c) => sum + c.remainingBalance, 0);
  const totalAdvanceCollected = contracts.reduce((sum, c) => sum + c.advancePaid, 0);

  // Calculate installments due this month
  const allInstallments = contracts.flatMap((c) =>
    c.schedule.map((s) => ({ ...s, contractId: c.id, contract: c }))
  );
  
  const paidInstallments = allInstallments.filter((s) => s.status === 'paid');
  const totalCollectedToDate = paidInstallments.reduce((sum, s) => sum + s.amountPaid, 0);

  // Overdue installments
  const overdueInstallments = allInstallments.filter(
    (s) => s.status === 'overdue' || s.contract.status === 'defaulter' || s.contract.status === 'legal_action'
  );
  const overdueAmount = overdueInstallments.reduce(
    (sum, s) => sum + (s.amountDue - s.amountPaid + s.lateFine),
    0
  );

  const activeContractsCount = contracts.filter((c) => c.status === 'active').length;
  const defaulterContractsCount = contracts.filter(
    (c) => c.status === 'defaulter' || c.status === 'legal_action'
  ).length;

  const collectionRate = Math.round(
    (totalCollectedToDate / (totalCollectedToDate + overdueAmount || 1)) * 100
  );

  // Aging distribution
  const criticalAccounts = contracts.filter(
    (c) => c.status === 'defaulter' || c.status === 'legal_action' || c.schedule.some((s) => s.status === 'overdue')
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner with Pakistani Business Context */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Portfolio Health & Recovery Operations
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Installment Recovery & Portfolio Dashboard
            </h2>
            <p className="mt-1 text-slate-300 text-sm">
              Live tracking for Pakistani retail installments, field collections (Roznamcha), guarantor verifications, and Section 489-F PPC default cases.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openNewContractModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>+ New Installment Plan</span>
            </button>
            <button
              onClick={() => switchToTab('planner')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <span>ERP Architecture Plan</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subtle background ornamentation */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Portfolio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Portfolio Value
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            {formatPKR(totalPortfolioValue)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Advance Received: {formatPKR(totalAdvanceCollected)}</span>
            <span className="font-semibold text-emerald-600">
              {Math.round((totalAdvanceCollected / totalPortfolioValue) * 100)}% Down
            </span>
          </div>
        </div>

        {/* Card 2: Active Outstanding Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Outstanding Receivables
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            {formatPKR(totalRemainingBalance)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Active Contracts: {activeContractsCount} files</span>
            <span className="font-semibold text-blue-600">On Track</span>
          </div>
        </div>

        {/* Card 3: Recovered Realized Cash */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Realized Recoveries
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            {formatPKR(totalCollectedToDate)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Collection Efficiency:</span>
            <span className="font-bold text-emerald-700">{collectionRate}%</span>
          </div>
        </div>

        {/* Card 4: Defaulter / Overdue Risk */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs bg-rose-50/20 hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Overdue / Defaulter Amount
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-rose-700 tracking-tight">
            {formatPKR(overdueAmount)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Critical Files: {defaulterContractsCount}</span>
            <span className="font-semibold text-rose-600">Immediate Action</span>
          </div>
        </div>
      </div>

      {/* Aging Analysis & Recovery Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Critical Action Accounts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Immediate Follow-Up & Overdue Accounts</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customers with delayed installments requiring field recovery officer visits or legal notices.
              </p>
            </div>
            <button
              onClick={() => switchToTab('contracts')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              View All ({contracts.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {criticalAccounts.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                Alhamdulillah, all active customer installments are paid on time!
              </div>
            ) : (
              criticalAccounts.map((contract) => {
                const unpaid = contract.schedule.filter((s) => s.status === 'overdue' || s.status === 'due');
                const overdueSum = unpaid.reduce((sum, s) => sum + s.amountDue + s.lateFine, 0);
                const hasImeiLock = contract.collateral.imeiRemoteLocked;

                return (
                  <div
                    key={contract.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {contract.customerName}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          ({contract.customerCnic})
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            contract.status === 'legal_action'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : contract.status === 'defaulter'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {contract.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                        <span className="font-medium text-slate-800">{contract.productName}</span>
                        <span>•</span>
                        <span>City: {contract.customerCity}</span>
                        <span>•</span>
                        <span>Zamin: {contract.guarantors[0]?.fullName || 'N/A'}</span>
                        {hasImeiLock && (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            📱 IMEI Locked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Overdue Due</div>
                        <div className="font-bold text-rose-700 text-sm">
                          {formatPKR(overdueSum)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={getWhatsAppLink(
                            contract.customerMobile,
                            `Assalam-o-Alaikum ${contract.customerName} sb. QistBazaar ki taraf se muttala kiya jata hai k aap ki mahana qist ${formatPKR(
                              overdueSum
                            )} for ${contract.productName} abhi tak wajib ul ada hai. Baraye meherbani foran jama karwayein ya recovery officer se rabta farmayein.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Send WhatsApp Reminder"
                        >
                          <Send className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => onSelectContract(contract)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                        >
                          Open File
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Recovery Officers & Field Beaten Tracks */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Field Recovery Officers (Roznamcha)</span>
              </h3>
              <button
                onClick={() => switchToTab('roznamcha')}
                className="text-xs text-emerald-700 font-semibold hover:underline"
              >
                Open Ledger
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {recoveryOfficers.map((officer) => {
                const progress = Math.min(
                  100,
                  Math.round((officer.collectedThisMonth / officer.targetMonthly) * 100)
                );

                return (
                  <div key={officer.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{officer.name}</div>
                        <div className="text-[11px] text-slate-500">{officer.assignedZone}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Cash in Hand</div>
                        <div className="font-mono font-bold text-emerald-700 text-xs">
                          {formatPKR(officer.cashInHandToday)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                        <span>Target: {formatPKR(officer.targetMonthly)}</span>
                        <span className="font-bold text-slate-800">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Business Blueprint Teaser */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-4 text-white shadow-xs">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Pakistani Installment ERP Rules</span>
            </div>
            <p className="mt-2 text-xs text-slate-200 leading-relaxed">
              Configured with standard Pakistani regulatory safeguards: 2 Verified Zamins with CNIC, Section 489-F PPC Undated Cheques, LESCO/K-Electric address validation, and Shariah Murabaha profit structures.
            </p>
            <button
              onClick={() => switchToTab('planner')}
              className="mt-3 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Full ERP Blueprint</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
